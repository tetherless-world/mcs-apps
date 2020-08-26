package io.github.tetherlessworld.mcsapps.lib.kg.formats.kgtk

import java.io.{BufferedInputStream, FileInputStream, FileNotFoundException, InputStream}
import java.nio.file.Path
import java.util.NoSuchElementException

import com.github.tototoshi.csv.{CSVReader, LineReader, MalformedCSVException, SourceLineReader, TSVFormat}
import io.github.tetherlessworld.mcsapps.lib.kg.formats.kgtk
import io.github.tetherlessworld.mcsapps.lib.kg.models.kg.{KgEdge, KgNode}
import org.apache.commons.compress.compressors.{CompressorException, CompressorStreamFactory}
import org.apache.commons.lang3.StringUtils
import org.slf4j.LoggerFactory

import scala.io.{Codec, Source}

final class KgtkEdgesTsvReader(source: Source) extends AutoCloseable with Iterable[KgtkEdgeWithNodes] {
  private val Format = new TSVFormat {
    override val escapeChar: Char = 0
  }

  // Have to inherit CSVReader since its constructor is protected
  private final class KgtkEdgesCSVReader(lineReader: LineReader) extends CSVReader(lineReader)(Format) {
  }

  // On encountering an unclosed open quote the CSVReader will continue reading lines from the LineReader
  // until a closing quote is found (on the assumption that there are newlines in quoted strings) or the
  // LineReader is exhausted.
  // We don't allow newlines in quoted strings, so we want the LineReader to exhaust after each line
  // rather than returning the next line.
  // This prevents the CSVReader from "eating" many lines in search of a closing quote.
  private final class SingleLineReader(line: String) extends LineReader {
    private[this] var nextLine = line;

    final override def readLineWithTerminator(): String = {
      val result = nextLine
      nextLine = null
      return result
    }

    override def close(): Unit = {}
  }

  private final val ValueDelimiter = '|';

  private implicit class RowWrapper(row: Map[String, String]) {
    def getNonBlank(key: String) =
      row.get(key).filter(!StringUtils.isBlank(_))

    def getList(key: String) =
      getNonBlank(key).flatMap(value => Option(value.split(ValueDelimiter).toList)) getOrElse List[String]()
  }

  private val logger = LoggerFactory.getLogger(getClass)

  final override def close(): Unit =
    source.close()

  final def iterator: Iterator[KgtkEdgeWithNodes] = {
    val sourceLineReader = new SourceLineReader(source)
    val csvHeader = new KgtkEdgesCSVReader(new SingleLineReader(sourceLineReader.readLineWithTerminator())).readNext()
    if (!csvHeader.isDefined) {
      logger.error("KGTK TSV file is empty or has no valid header")
      return List().iterator
    }

    new Iterator[KgtkEdgeWithNodes] {
      private[this] var _next: Option[KgtkEdgeWithNodes] = None

      final def hasNext: Boolean = {
        _next match {
          case Some(_) => true
          case None => _next = readNext(); _next.isDefined
        }
      }

      final def next(): KgtkEdgeWithNodes = {
        _next match {
          case Some(row) => {
            val _row = row
            _next = None
            _row
          }
          case None => readNext().getOrElse(throw new NoSuchElementException("next on empty iterator"))
        }
      }

      private def readNext(): Option[KgtkEdgeWithNodes] = {
        try {
          // #191: create a new CSVReader for every line
          // The previous approach of catching and ignoring MalformedCSVRowException's from the CSVReader leaves the CSVReader in an inconsistent internal state. For example, on an unclosed quote it keeps reading lines until it reaches the next quote, and skips all those lines. This is dropping quite a few lines.
          // Prior to that we did not catch MalformedCSVRowException at all, so any malformed line would stop iteration.
          // Our format doesn't allow newlines within quotes, so the only newline in a row should be the EOL terminator.
          Option(sourceLineReader.readLineWithTerminator()).flatMap(line => {
            new KgtkEdgesCSVReader(new SingleLineReader(line)).readNext().map(csvRowList => {
              val csvRowMap: Map[String, String] = csvHeader.get.zip(csvRowList).toMap

              val sources = csvRowMap.getList("source")
              val node1 = csvRowMap("node1")
              val node2 = csvRowMap("node2")
              val relation = csvRowMap("relation")

              kgtk.KgtkEdgeWithNodes(
                edge = KgEdge(
                  id = csvRowMap.get("id").getOrElse(s"${node1}-${relation}-${node2}"),
                  labels = csvRowMap.getList("relation;label"),
                  `object` = node2,
                  predicate = relation,
                  sentences = csvRowMap.getList("sentence"),
                  sourceIds = sources,
                  subject = node1
                ),
                node1 = KgNode(
                  id = csvRowMap("node1"),
                  labels = csvRowMap.getList("node1;label"),
                  pos = None,
                  sourceIds = sources,
                  pageRank = None
                ),
                node2 = KgNode(
                  id = csvRowMap("node2"),
                  labels = csvRowMap.getList("node2;label"),
                  pos = None,
                  sourceIds = sources,
                  pageRank = None
                ),
                sources = sources
              )
            })
          })
        } catch {
          case e: MalformedCSVException => {
            logger.warn("skipping malformed CSV line: {}", e.getMessage)
            readNext()
          }
        }
      }
    }
  }
}

object KgtkEdgesTsvReader {
  def open(filePath: Path): KgtkEdgesTsvReader =
    open(new BufferedInputStream(new FileInputStream(filePath.toFile))) // Don't use Source.fromFile because the file may be compressed

  def open(inputStream: InputStream): KgtkEdgesTsvReader =
    if (inputStream == null) {
      throw new FileNotFoundException("KgtkTsvReader missing resource")
    } else {
      new KgtkEdgesTsvReader(Source.fromInputStream(
        try {
          new CompressorStreamFactory().createCompressorInputStream(inputStream)
        } catch {
          case _: CompressorException => inputStream // CompressorStreamFactory throws an exception if it can't recognize a signature
        }
      )(Codec.UTF8))
    }
}

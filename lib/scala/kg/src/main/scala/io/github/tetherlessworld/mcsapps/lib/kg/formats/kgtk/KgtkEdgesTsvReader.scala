package io.github.tetherlessworld.mcsapps.lib.kg.formats.kgtk

import java.io.{BufferedInputStream, FileInputStream, FileNotFoundException, InputStream}
import java.nio.file.Path
import java.util.NoSuchElementException

import io.github.tetherlessworld.mcsapps.lib.kg.formats.kgtk
import io.github.tetherlessworld.mcsapps.lib.kg.models.kg.{KgEdge, KgNode}
import org.apache.commons.compress.compressors.{CompressorException, CompressorStreamFactory}
import org.apache.commons.lang3.StringUtils
import org.slf4j.LoggerFactory

import scala.io.{Codec, Source}

final class KgtkEdgesTsvReader(source: Source) extends AutoCloseable with Iterable[KgtkEdgeWithNodes] {
  // Multiple values in a column are separated by |
  // Per #220, we assume that columns do not contain \t and that individual values do not contain | or \t, so
  // we can do a two-level split of a TSV line: \t to get columns from a line and then | to get values from a column.
  // Values may contain internal quotes ("). Since we are using | as the internal delimiter, it is enough to look for the next |
  // (or \t) for the end of a value. So values do not to be outer-quoted and escaped (e.g., this value "with quotes" is OK|othervalue
  // and not "this value \"with quotes\" is OK"|othervalue.
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
    val lineWithIndexIterator = source.getLines().zipWithIndex

    if (!lineWithIndexIterator.hasNext) {
      logger.error("KGTK TSV file is empty")
      return List().iterator
    }
    val headerLine = lineWithIndexIterator.next()
    val headerLineSplit = headerLine._1.split('\t')

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
        while (lineWithIndexIterator.hasNext) {
          val (line, lineIndex) = lineWithIndexIterator.next
          var lineSplit = line.split('\t')
          while (lineSplit.length < headerLineSplit.length) {
            lineSplit :+= ""
          }
          val row = headerLineSplit.zip(lineSplit).toMap

          val sources = row.getList("source")
          val node1 = row("node1")
          val node2 = row("node2")
          val relation = row("relation")

          return Some(kgtk.KgtkEdgeWithNodes(
            edge = KgEdge(
              id = row.get("id").getOrElse(s"${node1}-${relation}-${node2}"),
              labels = row.getList("relation;label"),
              `object` = node2,
              predicate = relation,
              sentences = row.getList("sentence"),
              sources = sources,
              subject = node1
            ),
            node1 = KgNode(
              id = row("node1"),
              labels = row.getList("node1;label"),
              pos = None,
              sourceIds = sources,
              pageRank = None
            ),
            node2 = KgNode(
              id = row("node2"),
              labels = row.getList("node2;label"),
              pos = None,
              sourceIds = sources,
              pageRank = None
            ),
            sources = sources
          ))
        }
        None
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

package formats.kg.kgtk

import formats.CsvReader
import com.github.tototoshi.csv.{CSVReader, MalformedCSVException, TSVFormat}
import models.kg.{KgEdge, KgNode}
import org.slf4j.LoggerFactory
import java.nio.file.Path
import java.io.{FileNotFoundException, InputStream, Reader}
import java.util.NoSuchElementException

import formats.kg.kgtk

import scala.annotation.tailrec
import scala.util.Try

final class KgtkEdgesTsvReader(csvReader: CSVReader) extends CsvReader[KgtkEdgeWithNodes](csvReader) {
  private final val KgtkListDelim = '|';

  private val logger = LoggerFactory.getLogger(getClass)

  def iterator: Iterator[KgtkEdgeWithNodes] = {
    val csvHeader = csvReader.readNext()
    if (!csvHeader.isDefined) {
      logger.error("KGTK TSV file is empty or has no valid header")
      return List().iterator
    }

    // Adapted code from CSVReader
    new Iterator[KgtkEdgeWithNodes] {
      private[this] var _next: Option[KgtkEdgeWithNodes] = None

      def hasNext: Boolean = {
        _next match {
          case Some(row) => true
          case None => _next = readNext(); _next.isDefined
        }
      }

      def next(): KgtkEdgeWithNodes = {
        _next match {
          case Some(row) => {
            val _row = row
            _next = None
            _row
          }
          case None => readNext().getOrElse(throw new NoSuchElementException("next on empty iterator"))
        }
      }

      @tailrec
      private def readNext(): Option[KgtkEdgeWithNodes] = {
        try {
          csvReader.readNext().map(csvRowList => {
            val csvRowMap: Map[String, String] = csvHeader.get.zip(csvRowList).toMap

            val sources = csvRowMap.getList("source", KgtkListDelim)
            val node1 = csvRowMap("node1")
            val node2 = csvRowMap("node2")
            val relation = csvRowMap("relation")

            kgtk.KgtkEdgeWithNodes(
              edge = KgEdge(
                id = csvRowMap.get("id").getOrElse(s"${node1}-${relation}-${node2}"),
                labels = csvRowMap.getList("relation;label", KgtkListDelim),
                `object` = node2,
                predicate = relation,
                sentences = csvRowMap.getList("sentence", KgtkListDelim),
                sources = sources,
                subject = node1
              ),
              node1 = KgNode(
                id = csvRowMap("node1"),
                labels = csvRowMap.getList("node1;label", KgtkListDelim),
                pos = None,
                sourceIds = sources,
                pageRank = None
              ),
              node2 = KgNode(
                id = csvRowMap("node2"),
                labels = csvRowMap.getList("node2;label", KgtkListDelim),
                pos = None,
                sourceIds = sources,
                pageRank = None
              ),
              sources = sources
            )
          })
        } catch {
          case e: MalformedCSVException => {
            logger.warn("skipping malformed CSV line: {}", e)
            readNext()
          }
        }
      }
    }
  }
}

object KgtkEdgesTsvReader {
  private val csvFormat = new TSVFormat {
    override val escapeChar: Char = 0
  }

  def open(filePath: Path) = new KgtkEdgesTsvReader(CsvReader.open(filePath, csvFormat))

  def open(inputStream: InputStream) =
    if (inputStream == null)
      throw new FileNotFoundException("KgtkTsvReader missing resource")
    else
      new KgtkEdgesTsvReader(CsvReader.open(inputStream, csvFormat))

  def open(reader: Reader) = new KgtkEdgesTsvReader(CsvReader.open(reader, csvFormat))
}

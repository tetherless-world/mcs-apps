package formats.kg.kgtk

import formats.CsvReader
import com.github.tototoshi.csv.{CSVReader, TSVFormat}
import models.kg.{KgEdge, KgNode}
import org.slf4j.LoggerFactory
import java.nio.file.Path
import java.io.{FileNotFoundException, InputStream, Reader}

import formats.kg.kgtk

import scala.util.Try

final class KgtkEdgesTsvReader(csvReader: CSVReader) extends CsvReader[KgtkEdgeWithNodes](csvReader) {
  private final val KgtkListDelim = '|';

  private val logger = LoggerFactory.getLogger(getClass)

  def iterator: Iterator[KgtkEdgeWithNodes] =
    csvReader.iteratorWithHeaders.map(row => {
      val sources = row.getList("source", KgtkListDelim)
      val node1 = row("node1")
      val node2 = row("node2")
      val relation = row("relation")

      kgtk.KgtkEdgeWithNodes(
        edge = KgEdge(
          id = row.get("id").getOrElse(s"${node1}-${relation}-${node2}"),
          labels = row.getList("relation;label", KgtkListDelim),
          `object` = node2,
          origins = row.getList("origin", KgtkListDelim),
          questions = row.getList("question", KgtkListDelim),
          predicate = relation,
          sentences = row.getList("sentence", KgtkListDelim),
          sources = sources,
          subject = node1,
          weight = Try(row.getNonBlank("weight").get.toDouble).toOption
        ),
        node1 = KgNode(
          id = row("node1"),
          labels = row.getList("node1;label", KgtkListDelim),
          pos = None,
          sources = sources,
          pageRank = None
        ),
        node2 = KgNode(
          id = row("node2"),
          labels = row.getList("node2;label", KgtkListDelim),
          pos = None,
          sources = sources,
          pageRank = None
        ),
        sources = sources
      )
    }
    )
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
      new KgtkEdgesTsvReader (CsvReader.open(inputStream, csvFormat))
  def open(reader: Reader) = new KgtkEdgesTsvReader(CsvReader.open(reader, csvFormat))
}

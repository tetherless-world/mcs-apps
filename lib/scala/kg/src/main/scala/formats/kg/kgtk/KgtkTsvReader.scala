package formats.kg.kgtk

import formats.CsvReader
import com.github.tototoshi.csv.{CSVReader, TSVFormat}
import models.kg.{KgEdge, KgNode}
import org.slf4j.LoggerFactory
import java.nio.file.Path
import java.io.{FileNotFoundException, InputStream}

import formats.kg.kgtk

import scala.util.Try

final class KgtkTsvReader(csvReader: CSVReader) extends CsvReader[KgtkEdgeWithNodes](csvReader) {
  private final val KgtkListDelim = "|";

  private val logger = LoggerFactory.getLogger(getClass)

  def iterator: Iterator[KgtkEdgeWithNodes] =
    csvReader.iteratorWithHeaders.map(row => {
      val sources = row.getList("source", "|")
      kgtk.KgtkEdgeWithNodes(
        edge = KgEdge(
          id = row("id"),
          labels = row.getList("relation;label", KgtkListDelim),
          `object` = row("node2"),
          origins = row.getList("origin", KgtkListDelim),
          questions = row.getList("question", KgtkListDelim),
          predicate = row("relation"),
          sentences = row.getList("sentence", KgtkListDelim),
          sources = row.getList("source", KgtkListDelim),
          subject = row("node1"),
          weight = Try(row.getNonBlank("weight").get.toDouble).toOption
        ),
        node1 = KgNode(
          id = row("node1"),
          labels = row.getList("node1;label", KgtkListDelim),
          pos = None,
          sources = sources
        ),
        node2 = KgNode(
          id = row("node2"),
          labels = row.getList("node2;label", KgtkListDelim),
          pos = None,
          sources = sources
        )
      )
    }
    )
}

object KgtkTsvReader {
  private val csvFormat = new TSVFormat {}
  def open(filePath: Path) = new KgtkTsvReader(CsvReader.open(filePath, csvFormat))
  def open(inputStream: InputStream) =
    if (inputStream == null)
      throw new FileNotFoundException("KgtkTsvReader missing resource")
    else
      new KgtkTsvReader (CsvReader.open(inputStream, csvFormat))
}

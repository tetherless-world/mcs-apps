package formats.kg.kgtk

import formats.CsvReader
import com.github.tototoshi.csv.{CSVReader, TSVFormat}
import models.kg.KgEdge
import models.kg.KgNode
import org.slf4j.LoggerFactory
import java.nio.file.Path
import java.io.InputStream

final class KgtkTsvReader(csvReader: CSVReader) extends CsvReader[Tuple3[KgEdge, KgNode, KgNode]](csvReader) {
  private final val LIST_DELIM = "|";

  private val logger = LoggerFactory.getLogger(getClass)

  def iterator: Iterator[Tuple3[KgEdge, KgNode, KgNode]] =
    csvReader.iteratorWithHeaders.map(row => {
      val node1Labels = row.getList("node1;label", LIST_DELIM)
      val node2Labels = row.getList("node2;label", LIST_DELIM)
      Tuple3(
        KgEdge(
          datasource = row("source"),
          datasources = row.getList("source", "|"),
          id = row("id"),
          `object` = row("node2"),
          other = None,
          predicate = row("relation"),
          subject = row("node1"),
          weight = row.getNonBlank("weight").flatMap(weight => {
            try {
              Some(weight.toFloat)
            } catch {
              case e: NumberFormatException => {
                logger.warn("invalid edge weight: {}", weight)
                None
              }
            }
          })
        ),
        KgNode(
          aliases = Some(node1Labels.slice(1, node1Labels.size)),
          datasource = row("source"),
          datasources = row.getList("source", LIST_DELIM),
          id = row("node1"),
          label = node1Labels(0),
          other = None,
          pos = None
        ),
        KgNode(
          aliases = Some(node2Labels.slice(1, node2Labels.size)),
          datasource = row("source"),
          datasources = row.getList("source", LIST_DELIM),
          id = row("node2"),
          label = node2Labels(0),
          other = None,
          pos = None
        )
      )
    }
    )
}

object KgtkTsvReader {
  def open(filePath: Path) = new KgtkTsvReader(CsvReader.openCsvReader(filePath, new TSVFormat {}))
  def open(inputStream: InputStream) =
    if (inputStream != null) {
      new KgtkTsvReader(CsvReader.openCsvReader(inputStream, new TSVFormat {}))
    } else {
      throw new NullPointerException
    }
}
package formats.kg.cskg

import java.io.InputStream
import java.nio.file.Path

import com.github.tototoshi.csv.{CSVReader, TSVFormat}
import formats.CsvReader
import models.kg.KgEdge
import org.slf4j.LoggerFactory

import scala.util.Try

final class CskgEdgesCsvReader(csvReader: CSVReader) extends CsvReader[KgEdge](csvReader) {
  private val logger = LoggerFactory.getLogger(getClass)

  def iterator: Iterator[KgEdge] =
    csvReader.iteratorWithHeaders.map(row =>
      KgEdge(
        id = s"${row("subject")}-${row("predicate")}-${row("object")}",
        labels = List(),
        `object` = row("object"),
        origins = List(),
        questions = List(),
        predicate = row("predicate"),
        sentences = List(),
        sources = List(row("datasource")),
        subject = row("subject"),
        weight = Try(row.getNonBlank("weight").get.toDouble).toOption
    ))
}

object CskgEdgesCsvReader {
  private val csvFormat = new TSVFormat {
    override val escapeChar: Char = 0
  }
  def open(filePath: Path) = new CskgEdgesCsvReader(CsvReader.openCsvReader(filePath, csvFormat))
  def open(inputStream: InputStream) =
    if (inputStream != null) {
      new CskgEdgesCsvReader(CsvReader.openCsvReader(inputStream, csvFormat))
    } else {
      throw new NullPointerException
    }
}

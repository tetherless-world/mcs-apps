package formats.cskg

import java.io.InputStream
import java.nio.file.Path

import com.github.tototoshi.csv._
import models.cskg.Edge

final class CskgEdgesCsvReader(csvReader: CSVReader) extends CskgCsvReader[Edge](csvReader) {
  def toStream: Stream[Edge] =
    csvReader.toStreamWithHeaders.map(row =>
      Edge(
        datasource = row("datasource"),
        `object` = row("object"),
        other = row.getNonBlank("other"),
        predicate = row("predicate"),
        subject = row("subject"),
        weight = row.getNonBlank("weight").map(weight => weight.toFloat)
    ))
}

object CskgEdgesCsvReader {
  def open(filePath: Path) = new CskgEdgesCsvReader(CskgCsvReader.openCsvReader(filePath))
  def open(inputStream: InputStream) = new CskgEdgesCsvReader(CskgCsvReader.openCsvReader(inputStream))
}

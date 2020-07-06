package formats.kg.cskg

import java.io.InputStream
import java.nio.file.Path

import com.github.tototoshi.csv.CSVReader
import models.kg
import models.kg.KgNode

final class CskgNodesCsvReader(csvReader: CSVReader) extends CskgCsvReader[KgNode](csvReader) {
  def iterator: Iterator[KgNode] =
    csvReader.iteratorWithHeaders.map(row =>
      kg.KgNode(
        aliases = row.getNonBlank("aliases").map(aliases => aliases.split(' ').toList),
        datasource = row("datasource"),
        id = row("id"),
        label = row("label"),
        other = row.getNonBlank("other"),
        pos = row.getNonBlank("pos")
      )
    )
}

object CskgNodesCsvReader {
  def open(filePath: Path) = new CskgNodesCsvReader(CskgCsvReader.openCsvReader(filePath))
  def open(inputStream: InputStream) = new CskgNodesCsvReader(CskgCsvReader.openCsvReader(inputStream))
}

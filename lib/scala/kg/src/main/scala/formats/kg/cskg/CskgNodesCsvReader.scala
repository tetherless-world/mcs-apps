package formats.kg.cskg

import java.io.InputStream
import java.nio.file.Path

import com.github.tototoshi.csv.{CSVReader, TSVFormat}
import formats.CsvReader
import models.kg
import models.kg.KgNode

final class CskgNodesCsvReader(csvReader: CSVReader) extends CsvReader[KgNode](csvReader) {
  def iterator: Iterator[KgNode] =
    csvReader.iteratorWithHeaders.map(row =>
      kg.KgNode(
        sources = List(row("datasource")),
        id = row("id"),
        labels = List(row("label")) ::: row.getNonBlank("aliases").map(aliases => aliases.split(' ').toList).getOrElse(List()),
        pos = row.getNonBlank("pos")
      )
    )
}

object CskgNodesCsvReader {
  private val csvFormat = new TSVFormat {
    override val escapeChar: Char = 0
  }
  def open(filePath: Path) = new CskgNodesCsvReader(CsvReader.open(filePath, csvFormat))
  def open(inputStream: InputStream) = new CskgNodesCsvReader(CsvReader.open(inputStream, csvFormat))
}

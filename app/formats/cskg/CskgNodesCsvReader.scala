package formats.cskg

import java.io.InputStream
import java.nio.file.Path

import com.github.tototoshi.csv._
import models.cskg
import models.cskg.Node

final class CskgNodesCsvReader(csvReader: CSVReader) extends CskgCsvReader[Node](csvReader) {
  def toStream: Stream[Node] =
    csvReader.toStreamWithHeaders.map(row =>
      cskg.Node(
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

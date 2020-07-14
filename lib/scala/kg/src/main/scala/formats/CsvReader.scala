package formats

import com.github.tototoshi.csv.CSVReader
import java.nio.file.Path
import java.io.BufferedInputStream
import java.io.FileInputStream
import java.io.InputStream
import java.io.InputStreamReader
import org.apache.commons.compress.compressors.CompressorStreamFactory
import org.apache.commons.compress.compressors.CompressorException
import java.io.Reader
import com.github.tototoshi.csv.CSVFormat
import org.apache.commons.lang3.StringUtils

abstract class CsvReader[T](protected val csvReader: CSVReader) extends AutoCloseable with Iterable[T] {
  override def close(): Unit =
    csvReader.close()

  protected implicit class RowWrapper(row: Map[String, String]) {
    def getNonBlank(key: String) =
      row.get(key).flatMap(value => if (!StringUtils.isBlank(value)) Some(value) else None)

    def getList(key: String, delim: String) =
      getNonBlank(key).flatMap(value => Option(value.split(delim).toList)) getOrElse List[String]()
  }

  def iterator: Iterator[T]
}

object CsvReader {
  def openCsvReader(filePath: Path, csvFormat: CSVFormat): CSVReader = {
    // Need to buffer the file input stream so that the compressor factory can check it
    // CSVReader will close the input stream
    openCsvReader(new BufferedInputStream(new FileInputStream(filePath.toFile)), csvFormat)
  }

  def openCsvReader(inputStream: InputStream, csvFormat: CSVFormat): CSVReader = {
     openCsvReader(new InputStreamReader(
      try {
        new CompressorStreamFactory().createCompressorInputStream(inputStream)
      } catch {
        case _: CompressorException => inputStream // CompressorStreamFactory throws an exception if it can't recognize a signature
      }, CSVReader.DEFAULT_ENCODING),
      csvFormat
    )
  }

  def openCsvReader(reader: Reader, csvFormat: CSVFormat): CSVReader =
    CSVReader.open(reader)(csvFormat)
}
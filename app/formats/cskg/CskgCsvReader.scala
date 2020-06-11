package formats.cskg

import java.io.{BufferedInputStream, FileInputStream, InputStream, InputStreamReader, Reader}
import java.nio.file.Path

import com.github.tototoshi.csv.{CSVFormat, CSVReader, TSVFormat}
import org.apache.commons.compress.compressors.{CompressorException, CompressorStreamFactory}
import org.apache.commons.lang3.StringUtils

abstract class CskgCsvReader[T](protected val csvReader: CSVReader) extends AutoCloseable {
  override def close(): Unit =
    csvReader.close()

  protected implicit class RowWrapper(row: Map[String, String]) {
    def getNonBlank(key: String) =
      row.get(key).flatMap(value => if (!StringUtils.isBlank(value) && value != "::") Some(value) else None)
  }

  def toStream: Stream[T]
}

object CskgCsvReader {
  private implicit val csvFormat: CSVFormat = new TSVFormat {}

  def openCsvReader(filePath: Path): CSVReader = {
    // Need to buffer the file input stream so that the compressor factory can check it
    val inputStream = new BufferedInputStream(new FileInputStream(filePath.toFile))
    // CSVReader will close the input stream
    openCsvReader(inputStream)
  }

  def openCsvReader(inputStream: InputStream): CSVReader = {
    val compressedInputStream =
      try {
        new CompressorStreamFactory().createCompressorInputStream(inputStream)
      } catch {
        case _: CompressorException => inputStream  // CompressorStreamFactory throws an exception if it can't recognize a signature
      }

    openCsvReader(new InputStreamReader(compressedInputStream, CSVReader.DEFAULT_ENCODING))
  }

  def openCsvReader(reader: Reader): CSVReader =
    CSVReader.open(reader)
}

package io.github.tetherlessworld.mcsapps.lib.kg.formats.kgtk

import java.io.{BufferedInputStream, FileInputStream, FileNotFoundException, InputStream}
import java.nio.file.Path
import java.util.NoSuchElementException

import io.github.tetherlessworld.mcsapps.lib.kg.formats.kgtk
import io.github.tetherlessworld.mcsapps.lib.kg.models.kg.{KgEdge, KgNode}
import org.apache.commons.compress.compressors.{CompressorException, CompressorStreamFactory}
import org.apache.commons.lang3.StringUtils
import org.slf4j.LoggerFactory

import scala.io.{Codec, Source}

final class KgtkEdgesTsvIterator(source: Source) extends AutoCloseable with Iterator[KgtkEdgeWithNodes] {
  // Multiple values in a column are separated by |
  // Per #220, we assume that columns do not contain \t and that individual values do not contain | or \t, so
  // we can do a two-level split of a TSV line: \t to get columns from a line and then | to get values from a column.
  // Values may contain internal quotes ("). Since we are using | as the internal delimiter, it is enough to look for the next |
  // (or \t) for the end of a value. So values do not to be outer-quoted and escaped (e.g., this value "with quotes" is OK|othervalue
  // and not "this value \"with quotes\" is OK"|othervalue.
  private final val ValueDelimiter = '|';

  private[this] var _next: Option[KgtkEdgeWithNodes] = None
  private val lineWithIndexIterator = source.getLines().zipWithIndex
  private val headerLineSplit: List[String] =
    if (lineWithIndexIterator.hasNext) {
      val headerLine = lineWithIndexIterator.next()
      headerLine._1.split('\t').toList
    } else {
      List()
    }

  private val logger = LoggerFactory.getLogger(getClass)

  final override def close(): Unit =
    source.close()


  final def hasNext: Boolean = {
    _next match {
      case Some(_) => true
      case None => _next = readNext(); _next.isDefined
    }
  }

  final def next(): KgtkEdgeWithNodes = {
    _next match {
      case Some(row) => {
        val _row = row
        _next = None
        _row
      }
      case None => readNext().getOrElse(throw new NoSuchElementException("next on empty iterator"))
    }
  }

  private implicit class RowWrapper(row: Map[String, String]) {
    def getNonBlank(key: String) =
      row.get(key).filter(!StringUtils.isBlank(_))

    def getList(key: String) =
      getNonBlank(key).toList.flatMap(_.split(ValueDelimiter).filter(!StringUtils.isBlank(_)).toList)
  }

  private def parseLine(line: String, lineIndex: Int): Option[KgtkEdgeWithNodes] = {
    if (StringUtils.isBlank(line)) {
      logger.info("line {} is blank, skipping", lineIndex)
      return None
    }

    var lineSplit = line.split('\t')
    while (lineSplit.length < headerLineSplit.length) {
      lineSplit :+= ""
    }
    val row = headerLineSplit.zip(lineSplit).toMap

    val sources = row.getList("source")
    if (sources.isEmpty) {
      logger.info("line {} is missing sources, skipping", lineIndex)
      return None
    }

    val node1 = row.getNonBlank("node1")
    if (!node1.isDefined) {
      logger.info("line {} is missing node1, skipping", lineIndex)
      return None
    }

    val node2 = row.getNonBlank("node2")
    if (!node2.isDefined) {
      logger.info("line {} is missing node2, skipping", lineIndex)
      return None
    }

    val relation = row.getNonBlank("relation")
    if (!relation.isDefined) {
      logger.info("line {} is missing relation, skipping", lineIndex)
      return None
    }

    Some(kgtk.KgtkEdgeWithNodes(
      edge = KgEdge(
        id = row.getNonBlank("id").getOrElse(s"${node1}-${relation}-${node2}"),
        labels = row.getList("relation;label"),
        `object` = node2.get,
        predicate = relation.get,
        sentences = row.getList("sentence"),
        sources = sources,
        subject = node1.get
      ),
      node1 = KgNode(
        id = node1.get,
        labels = row.getList("node1;label"),
        pos = None,
        sourceIds = sources,
        pageRank = None
      ),
      node2 = KgNode(
        id = node2.get,
        labels = row.getList("node2;label"),
        pos = None,
        sourceIds = sources,
        pageRank = None
      ),
      sources = sources
    ))
  }

  private def readNext(): Option[KgtkEdgeWithNodes] = {
    logger.info("reading")
    while (lineWithIndexIterator.hasNext) {
      val (line, lineIndex) = lineWithIndexIterator.next
      logger.info("{}", lineIndex)
      val parsedLine = parseLine(line, lineIndex)
      if (parsedLine.isDefined) {
        return parsedLine
      } else {
        logger.info("unparsed line")
      }
    }
    None
  }
}

object KgtkEdgesTsvIterator {
  def open(filePath: Path): KgtkEdgesTsvIterator =
    open(new BufferedInputStream(new FileInputStream(filePath.toFile))) // Don't use Source.fromFile because the file may be compressed

  def open(inputStream: InputStream): KgtkEdgesTsvIterator =
    if (inputStream == null) {
      throw new FileNotFoundException("KgtkTsvReader missing resource")
    } else {
      new KgtkEdgesTsvIterator(Source.fromInputStream(
        try {
          new CompressorStreamFactory().createCompressorInputStream(inputStream)
        } catch {
          case _: CompressorException => inputStream // CompressorStreamFactory throws an exception if it can't recognize a signature
        }
      )(Codec.UTF8))
    }
}

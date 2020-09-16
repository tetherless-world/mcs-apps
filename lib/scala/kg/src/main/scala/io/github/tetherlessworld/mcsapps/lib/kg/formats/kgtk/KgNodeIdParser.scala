package io.github.tetherlessworld.mcsapps.lib.kg.formats.kgtk

import org.slf4j.LoggerFactory

object KgNodeIdParser {
  private val logger = LoggerFactory.getLogger("KgNodeIdParser")

  private def parseCskgConceptNetNodeId(nodeId: String): KgParsedNodeId = {
    val nodeIdSplit = nodeId.split('/')
    assert(nodeIdSplit(0).isEmpty)
    assert(nodeIdSplit(1) == "c")
    assert(nodeIdSplit(2) == "en")
    val concept = nodeIdSplit(3)
    if (nodeIdSplit.length > 4) {
      val pos = nodeIdSplit(4)
      assert(pos.nonEmpty)
      KgParsedNodeId(pos = Some(pos.charAt(0)), wordNetSenseNumber = None)
    } else {
      KgParsedNodeId(pos = None, wordNetSenseNumber = None)
    }
  }

  private def parseCskgWordNetNodeId(nodeId: String): KgParsedNodeId = {
    // wn:angiotensin_ii_inhibitor.n.01
    val nodeIdSplit = nodeId.split(':')
    assert(nodeIdSplit.length == 2)
    val unqualifiedNodeIdSplit = nodeIdSplit(1).split('.')
    if (unqualifiedNodeIdSplit.length < 3) {
      return KgParsedNodeId(pos = None, wordNetSenseNumber = None)
    }
    assert(unqualifiedNodeIdSplit.length == 3, nodeId)
    val word = unqualifiedNodeIdSplit(0)
    val pos = unqualifiedNodeIdSplit(1)
    assert(pos.length == 1)
    val wordNetSenseNumber = unqualifiedNodeIdSplit(2).toInt
    KgParsedNodeId(pos = Some(pos.charAt(0)), wordNetSenseNumber = Some(wordNetSenseNumber))
  }

//  def parseMergedNodeId(lineIndex: Int, mergedNodeId: String): KgParsedNodeId =
//    parseMergedNodeId(lineIndex, mergedNodeId, List(mergedNodeId))
//
//  private def parseMergedNodeId(lineIndex: Int, mergedNodeId: String, preMergeNodeIds: List[String]): KgParsedNodeId = {
//    if (preMergeNodeIds.isEmpty) {
//      throw new UnsupportedOperationException("node id's cannot be empty")
//    } else if (preMergeNodeIds.length == 1) {
//      parsePreMergeNodeId(lineIndex, preMergeNodeIds(0))
//    } else {
//      val parses = preMergeNodeIds.map(parsePreMergeNodeId(lineIndex, _))
//      val partsOfSpeech = parses.flatMap(_.pos.toList)
//      if (partsOfSpeech.isEmpty) {
//        parses(0)  // Doesn't matter if we return anything
//      } else if (partsOfSpeech.length == 1) {
//        val partOfSpeech = partsOfSpeech(0)
//        val parseWithPosAndWordNet = parses.find(parse => parse.pos.isDefined && parse.pos.get == partOfSpeech && parse.wordNetSenseNumber.isDefined)
//        if (parseWithPosAndWordNet.isDefined) {
//          parseWithPosAndWordNet.get
//        } else {
//          val parseWithPos = parses.find(parse => parse.pos.isDefined && parse.pos.get == partOfSpeech)
//          parseWithPos.get
//        }
//      } else {
//        // Conflict, don't return anything
//        logger.warn("merged node id has part of speech conflict: {}", mergedNodeId)
//        KgParsedNodeId(pos = None, wordNetSenseNumber = None)
//      }
//    }
//  }

  def parseNodeId(lineIndex: Int, nodeId: String): KgParsedNodeId = {
    var parsed = KgParsedNodeId(pos = None, wordNetSenseNumber = None)
    if (nodeId.startsWith("/c/en")) {
      parsed = parseCskgConceptNetNodeId(nodeId)
    } else {
      val nodeIdSplit = nodeId.split(':')
      if (nodeIdSplit.length == 2) {
        val namespace = nodeIdSplit(0)
        val unqualifiedNodeId = nodeIdSplit(1)
        namespace match {
          case "at" | "fn" | "rg" | "wd" =>
          case "wn" => parsed = parseCskgWordNetNodeId(nodeId)
          case _ => logger.debug("unrecognized node id format line {}: {}", lineIndex, nodeId)
        }
      }
    }

    if (parsed.pos.isDefined) {
      val pos = parsed.pos.get
      assert(pos == 'a' || pos == 'n' || pos == 'r' || pos == 's' || pos == 'v', nodeId)
    }
    if (parsed.wordNetSenseNumber.isDefined) {
      assert(parsed.wordNetSenseNumber.get >= 0)
    }
    parsed
  }
}

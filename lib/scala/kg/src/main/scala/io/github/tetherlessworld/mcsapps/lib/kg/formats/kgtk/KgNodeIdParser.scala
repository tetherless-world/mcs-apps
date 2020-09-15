package io.github.tetherlessworld.mcsapps.lib.kg.formats.kgtk

import org.slf4j.LoggerFactory

object KgNodeIdParser {
  private val logger = LoggerFactory.getLogger("KgNodeIdParser")

  def parseMergedNodeId(mergedNodeId: String): KgParsedNodeId =
    parseMergedNodeId(mergedNodeId, mergedNodeId.split('-').toList)

  private def parseMergedNodeId(mergedNodeId: String, preMergeNodeIds: List[String]): KgParsedNodeId = {
    if (preMergeNodeIds.isEmpty) {
      throw new UnsupportedOperationException("node id's cannot be empty")
    } else if (preMergeNodeIds.length == 1) {
      parsePreMergeNodeId(preMergeNodeIds(0))
    } else {
      val parses = preMergeNodeIds.map(parsePreMergeNodeId(_))
      val partsOfSpeech = parses.flatMap(_.pos.toList)
      if (partsOfSpeech.isEmpty) {
        parses(0)  // Doesn't matter if we return anything
      } else if (partsOfSpeech.length == 1) {
        val partOfSpeech = partsOfSpeech(0)
        val parseWithPosAndWordNet = parses.find(parse => parse.pos.isDefined && parse.pos.get == partOfSpeech && parse.wordNetSenseNumber.isDefined)
        if (parseWithPosAndWordNet.isDefined) {
          parseWithPosAndWordNet.get
        } else {
          val parseWithPos = parses.find(parse => parse.pos.isDefined && parse.pos.get == partOfSpeech)
          parseWithPos.get
        }
      } else {
        // Conflict, don't return anything
        logger.warn("merged node id has part of speech conflict: {}", mergedNodeId)
        KgParsedNodeId(pos = None, wordNetSenseNumber = None)
      }
    }
  }

  private def parseConceptNetNodeId(nodeId: String): KgParsedNodeId = {
    val nodeIdSplit = nodeId.split('/')
    KgParsedNodeId(pos = None, wordNetSenseNumber = None)
  }

  private def parsePreMergeNodeId(preMergeNodeId: String): KgParsedNodeId = {
    if (preMergeNodeId.startsWith("/c/en")) {
      parseConceptNetNodeId(preMergeNodeId)
    } else {
      KgParsedNodeId(pos = None, wordNetSenseNumber = None)
    }
  }
}

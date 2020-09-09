package io.github.tetherlessworld.mcsapps.lib.kg.formats.kgtk

import io.github.tetherlessworld.mcsapps.lib.kg.data.{DataResource, TestKgtkDataResources}
import io.github.tetherlessworld.twxplore.lib.base.WithResource
import org.scalatest.{Matchers, WordSpec}

import scala.io.Source

class KgtkEdgesTsvReaderSpec extends WordSpec with Matchers with WithResource {
  "KGTK edges TSV Reader" can {
    "read the test data" in {
      withResource(KgtkEdgesTsvReader.open(TestKgtkDataResources.edgesTsvBz2.getAsStream())) { reader =>
        val data = reader.iterator.toList
        data.size should be > 0
        for (edgeWithNodes <- data) {
          val edge = edgeWithNodes.edge
          edge.id should not be empty
          edge.`object` should not be empty
          edge.subject should not be empty
          edge.predicate should not be empty
          edge.sources.size should be > 0
          for (node <- List(edgeWithNodes.node1, edgeWithNodes.node2)) {
            node.id should not be empty
            node.labels.size should be > 0
            node.sourceIds.size should be > 0
          }
        }
      }
    }

    "skip an unparseable line" in {
      val tsv = DataResource("/io/github/tetherlessworld/mcsapps/lib/kg/formats/kgtk/unparseable_line.tsv").getAsString()
      withResource(new KgtkEdgesTsvReader(Source.fromString(tsv))) { reader =>
        val data = reader.iterator.toList
        data.size should be(3)  // 5 lines, two unparseable because of open quotes
      }
    }

    "read the beginning of the cskg_connected.tsv" in {
      val tsv = DataResource("/io/github/tetherlessworld/mcsapps/lib/kg/formats/kgtk/cskg_connected_head.tsv").getAsString()
      withResource(new KgtkEdgesTsvReader(Source.fromString(tsv))) { reader =>
        val data = reader.iterator.toList
        data.size should be(999)
      }
    }
  }
}

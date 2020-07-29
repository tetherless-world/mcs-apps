package stores

import io.github.tetherlessworld.twxplore.lib.base.WithResource
import me.tongfei.progressbar.{DelegatingProgressBarConsumer, ProgressBarBuilder}
import org.slf4j.Logger

trait WithIteratorProgress extends WithResource {
  def withIteratorProgress[T, V](iterator: Iterator[T], logger: Logger, taskName: String)(f: (Iterator[T]) => V): V = {
    val progressBar =
      new ProgressBarBuilder()
        .setInitialMax(0)
        .setTaskName(taskName)
        .setConsumer(new DelegatingProgressBarConsumer(message => logger.info(message)))
        .setUpdateIntervalMillis(10000)
        .showSpeed
        .build
    withResource(progressBar) { progressBar =>
      f(iterator.map(x => {
        progressBar.step();
        x
      }))
    }
  }
}

import elasticlunr from 'elasticlunr'

/**
 * Set up the pipeline for indexing content in multiple languages. The
 * corresponding lunr.{lang} files must be loaded before calling this
 * function; English ('en') is built in.
 * Returns: a lunr plugin for use in your indexer.
 * Known drawback: every word will be stemmed with stemmers for every
 * language. This could mean that sometimes words that have the same
 * stemming root will not be stemmed as such.
 * @param lunr Elasticlunr
 */
export default function multi(lunr: elasticlunr.Elasticlunr) {
  lunr.multiLanguage = function(...languages: string[]) {
    const nameSuffix = languages.join('-')
    let wordCharacters = ''
    const pipeline: any[] = []
    // const searchPipeline: any[] = []
    for (let i = 0; i < languages.length; ++i) {
      if (languages[i] == 'en') {
        wordCharacters += '\\w'
        pipeline.unshift(lunr.stopWordFilter)
        pipeline.push(lunr.stemmer)
        // searchPipeline.push(lunr.stemmer)
      } else {
        wordCharacters += lunr[languages[i]].wordCharacters
        pipeline.unshift(lunr[languages[i]].stopWordFilter)
        pipeline.push(lunr[languages[i]].stemmer)
        // searchPipeline.push(lunr[languages[i]].stemmer)
      }
    }
    if (lunr.trimmerSupport) {
      const multiTrimmer = lunr.trimmerSupport.generateTrimmer(wordCharacters)
      elasticlunr.Pipeline.registerFunction(
        multiTrimmer,
        'lunr-multi-trimmer-' + nameSuffix
      )
      pipeline.unshift(multiTrimmer)
    }
    return function(this: elasticlunr.Index) {
      this.pipeline.reset()

      this.pipeline.add.apply(this.pipeline, pipeline)

      // for lunr version 2
      // this is necessary so that every searched word is also stemmed before
      // in lunr <= 1 this is not needed, as it is done using the normal pipeline
      //   if (this.searchPipeline) {
      //     this.searchPipeline.reset()
      //     this.searchPipeline.add.apply(this.searchPipeline, searchPipeline)
      //   }
    }
  }
}

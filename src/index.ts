/*! spell-checker: disable
 * Lunr languages, `Japanese` language
 * https://github.com/MihaiValentin/lunr-languages
 *
 * Copyright 2014, Chad Liu
 * http://www.mozilla.org/MPL/
 */
/*!
 * based on
 * Snowball JavaScript Library v0.3
 * http://code.google.com/p/urim/
 * http://snowball.tartarus.org/
 *
 * Copyright 2010, Oleg Mazko
 * http://www.mozilla.org/MPL/
 * spell-checker: enable
 */
import elasticlunr from 'elasticlunr'
import {TinySegmenter} from './TinySegmenter'
import stemmer from './JPStemmer'

export default function lunr(lunr: elasticlunr.Elasticlunr): void {
  /* register specific locale function */
  const ja = function(this: elasticlunr.Index): void {
    this.pipeline.reset()
    this.pipeline.add(ja.trimmer, ja.stopWordFilter, ja.stemmer)
    // change the tokenizer for japanese one
    lunr.tokenizer = ja.tokenizer
  }
  const segmenter = new TinySegmenter()
  function segment(token: string): string[] {
    return segmenter.segment(token).filter((token: string): boolean => !!token)
  }

  function tokenizer(str: string | string[]): string[] {
    if (!arguments.length || str === null || str === undefined) return []
    if (Array.isArray(str)) {
      const result = []
      for (let i = 0; i < str.length; i++) {
        const token = str[i]
        if (token === null || token === undefined) {
          continue
        }
        const tokens = lunr.utils
          .toString(token)
          .toLowerCase()
          .split(lunr.tokenizer.seperator)
        for (let j = 0; j < tokens.length; j++) {
          const segments = segment(tokens[j])
          for (let k = 0; k < segments.length; k++) {
            result[result.length] = segments[k]
          }
        }
      }
      return result
    }
    return segment(str)
  }
  tokenizer.defaultSeperator = lunr.tokenizer.defaultSeperator
  tokenizer.seperator = lunr.tokenizer.seperator
  tokenizer.setSeperator = lunr.tokenizer.setSeperator
  tokenizer.resetSeperator = lunr.tokenizer.resetSeperator
  tokenizer.getSeperator = lunr.tokenizer.getSeperator

  ja.tokenizer = tokenizer

  /* lunr stemmer function */
  ja.stemmer = stemmer

  /* stop word filter function */
  const stopWordFilter = function(token: string): string | undefined {
    if (token && ja.stopWordFilter.stopWords[token] !== true) {
      return token
    }
  }

  /* lunr trimmer function */
  ja.wordCharacters =
    '一二三四五六七八九十百千万億兆一-龠々〆ヵヶぁ-んァ-ヴーｱ-ﾝﾞa-zA-Zａ-ｚＡ-Ｚ0-9０-９'
  if (lunr.trimmerSupport) {
    ja.trimmer = lunr.trimmerSupport.generateTrimmer(ja.wordCharacters)
    elasticlunr.Pipeline.registerFunction(ja.trimmer, 'trimmer-ja')
  }

  // The space at the beginning is crucial: It marks the empty string
  // as a stop word. lunr.js crashes during search when documents
  // processed by the pipeline still contain the empty string.
  // stopWord for japanese is from http://www.ranks.nl/stopwords/japanese
  stopWordFilter.stopWords = ' これ それ あれ この その あの ここ そこ あそこ こちら どこ だれ なに なん 何 私 貴方 貴方方 我々 私達 あの人 あのかた 彼女 彼 です あります おります います は が の に を で え から まで より も どの と し それで しかし'
    .split(' ')
    .reduce<elasticlunr.StopWords>(
      (acc, token): elasticlunr.StopWords => ({...acc, [token]: true}),
      {}
    )
  ja.stopWordFilter = stopWordFilter

  elasticlunr.Pipeline.registerFunction(ja.stemmer, 'stemmer-ja')
  elasticlunr.Pipeline.registerFunction(ja.stopWordFilter, 'stopWordFilter-ja')
  lunr.ja = ja
}

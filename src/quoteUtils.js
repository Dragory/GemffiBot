export default {
	/**
	 * ty Jani <3
	 *
	 * Determines a chance whether given text might be considered
	 * "Interesting quote" in Finnish language
	 *
	 * Each quote is considered not interesting at first (change: 0.0)
	 * Some properties of the quote rise or lowers this chance
	 *
	 * There are two types on interestingness changes: fixed and percentual
	 * Fixed changes are for example: chance += 0.1
	 * Which raises the chance by 10 points
	 * Percentual chances are like: chance *= 1.1
	 * Which raises the chance by 10%
	 * Also, if the quote isn't considered interesting by any fixed steps, percentual raises are
	 *
	 * This algorithm considers the following properties of the quote:
	 * - Word count, shorter quotes are more memorable
	 * - Emoticons, they can be funny
	 * - Links, links are not memorable
	 * - Trigger words, quotes beginning with "ja" are not interesting
	 *
	 * Chance may never be more than 80%
	 *
	 * @param  {String} text Quote to check
	 * @return {Number}      Chance of being interesting
	 */
	getTextInterestingnessValue(text) {
	    var interestingness = 0;
	    var linkregex = /(http|https|ftp|ftps)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,24}(\/\S*)?/gi;
	    var emoticons = /:+(-)*D|xd+(plz)?|;\)|:\^\)/i;
	    var pretriggers = ["se", "kuka", "joka", "multa", "jolta", "siltä", "sen", "nice", "noice"];
	    var badtriggers = ["ja"];

	    var words = text.toLowerCase().split(/\s/);
	    var randombias = 1; // no bias for now but keep the variable around

	    // Link check
	    if (linkregex.test(text))
	        return 0.001; // Links have 0.1% chance to be a quote, no excuses

	    interestingness += 0.1;

	    /** Word length analysis */
	    // Let's assume that interestingness drops naturally
	    // http://i.imgur.com/yUxYzzt.jpg
	    var eCurve = function(n) {
	        return 1/(Math.E * n);
	    }
	    interestingness *= 1 + eCurve(words.length);

	    /** Emoticon analysis **/
	    if(words.length === 1 && emoticons.test(text))
	        interestingness += 0.16;

	    /** Trigger analysis **/
	    if(pretriggers.indexOf(words[0]) !== -1)
	        interestingness *= 1.8;
	    if(badtriggers.indexOf(words[0]) !== -1)
	        interestingness *= 0.6;

	    return Math.min(randombias * interestingness, 0.8);
	}
};

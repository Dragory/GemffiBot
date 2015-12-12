import "babel/polyfill";

import api from './api';
import cmd from './cmd';

/**
 * COMMAND IMPORTS
 */

import nameSaver from './commands/nameSaver';
import statsCmd from './commands/stats';
import eightBallCmd from './commands/8ball';
import rollCmd from './commands/roll';
import idCmd from './commands/id';
import oiCmd from './commands/oi';
import quoteCmd from './commands/quote';

import coinsGetCmd from './commands/coinsGet';
import coinsBetCmd from './commands/coinsBet';
import coinsSetCmd from './commands/coinsSet';
import coinsTopCmd from './commands/coinsTop';

import commandsCmd from './commands/commands';

import markovReadCmd from './commands/markovRead';
import markovGenerateCmd from './commands/markovGenerate';
import markovStatsCmd from './commands/markovStats';

/**
 * COMMAND LISTING
 */

let commands = [
	{cmd: nameSaver},
	{cmd: statsCmd},
	{cmd: eightBallCmd},
	{cmd: rollCmd},
	{cmd: idCmd},
	{cmd: oiCmd},

	{cmd: coinsGetCmd},
	{cmd: coinsBetCmd},
	{cmd: coinsSetCmd},
	{cmd: coinsTopCmd},

	{cmd: commandsCmd},

	{cmd: markovGenerateCmd},
	{cmd: markovReadCmd},
	{cmd: markovStatsCmd},

	{cmd: quoteCmd}
];

/**
 * START
 */

let updateHandler = cmd.createUpdateHandler(commands, api.nextUpdate);
api.onUpdate(updateHandler);

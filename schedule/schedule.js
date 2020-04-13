/*

item object:

[{
	title: 'My Item Title'
	loc: 'Olsson 009',
	start: 8.5,
	end: 10,
	dows: [1, 3, 5]
}, ...]

mowefr
8:30-10 Calculus at Olsson 009

*/

const days = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa']

/** takes text representing some items in format
 **
 ** mowefr
 ** 8:30-10 Calculus at Olsson 009
 ** 11-12   Lunch
 **
 ** tu
 ** 12-15:45 eat
 **
 ** and returns a list of items
 */
function parseSchedule(text)
{
	let items = []
	for (let chunk of text.split('\n\n'))
		if (chunk)
			items = items.concat(parseChunk(chunk))
	return items
}

/** takes text separated by single newlines
 ** text is in following format:
 **
 ** mowefr
 ** 8:30-10 Calculus at Olsson 009
 ** 11-12   Lunch
 **
 ** and returns its representative items
 */
function parseChunk(chunkText)
{
	let items = []
	let lines = chunkText.split('\n')
	let dows = lines[0].toLowerCase().split(/(?=(?:..)*$)/).map(dow => days.indexOf(dow))
	for (let line of lines.slice(1, lines.length)) {
		let spaces = line.split(' ')
		let atIndex = line.indexOf(' at ')
		items.push({
			title: line.substring(12, (atIndex == -1)? line.length : atIndex),
			loc: (atIndex == -1)? 'idk lmao' : line.substring(atIndex + 4),
			start: parseHours(line, 0, 5),
			end: parseHours(line, 6, 5),
			dows: dows
		})
		//console.log(items)
	}
	
	return items
}

function parseHours(string, start, end)
{
	parts = string.substr(start, end).split(':')
	
	return parseInt(parts[0]) + parseInt(parts[1])/60
}

function getTextSchedule(schedule)
{
	console.log(schedule)
	let append = ''
	for (tal of schedule)
		append += `${tal.dows.map(i => days[i]).join('')}\n${to24Hour(tal.start)}-${to24Hour(tal.end)} ${tal.title} at ${tal.loc}\n\n`
	return append
}

function to24Hour(hrt)
{
	let hours = Math.floor(hrt)
	let minutes = Math.round(60 * (hrt - hours))
	return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}
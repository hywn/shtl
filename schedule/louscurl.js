function promiseClass(classCode, pfunc)
{
	scurl("https://louslist.org/sectiontip.php?ClassNumber=" + classCode, text => {
		let p = new Parser(text)
		let title = p.du('class="InfoClass">').du('class="InfoClass">').deleteUntil('<br')
		let tals = []
		for (tal of getTALs(p))
			tals.push({
				title: title,
				loc: tal.loc,
				dows: tal.dows,
				start: tal.start,
				end: tal.end
			})
		pfunc(tals)
	})
}

function promiseSchedule(classCodes, pfunc)
{
	let schedule = []
	let curr = 0, goal = classCodes.length
	if (goal == 0) { pfunc(""); return }
	for (let classCode of classCodes) {
		promiseClass(classCode, classes => {
			schedule = schedule.concat(classes)
			if (++curr == goal) pfunc(schedule)
		})
	}
}

let days = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa']

function getTALs(p, times=[])
{
	if (times.length == 0) p.deleteUntil('class="InfoMeetings"')
	
	let timeStuff = p.du('</td><td>').deleteUntil("</td><td>").split(' ') // 'MoWeFr 9:00AM - 9:50AM' split by spaces

	times.push({
		loc: p.deleteUntil("</td>"),
		dows: timeStuff[0].toLowerCase().split(/(?=(?:..)*$)/).map(textdow => days.indexOf(textdow)), // 'MoWeFr' -> 'mo', 'we', 'fr'
		start: toHRT(timeStuff[1]),
		end: toHRT(timeStuff[3])
	})
	
	if (p.continueUntil('</table>').includes('<strong>')) {
		p.clear(true)
		return getTALs(p, times)
	}
	
	return times;
}

function toHRT(textTime) // 10:00PM -> 22:00 -> 22
{
	let numbers = textTime.match(/\d{1,}/g).map(num => Number(num));
	let ampm = textTime.toLowerCase().match(/am|pm/g)[0] === 'pm' ? 12 : 0;
	return (ampm + numbers[0] % 12) + numbers[1] / 60
}

function scurl(url, cfunc)
{
	return $.getJSON('https://api.allorigins.win/get?url=' + encodeURIComponent(url), response => cfunc(response.contents));
}

class Parser
{
	constructor (text, bindex, bsize)
	{
		this.text = text
		this.bindex = 0
		this.bsize = 0
	}
	
	getBuffer (offset=0) { return this.text.substring(this.bindex, this.bindex + this.bsize + offset) }
	
	reset () { this.bindex = this.bsize = 0 }
	
	clear (keepBuffer=false)
	{
		if(!keepBuffer) this.bindex += this.bsize
		this.bsize = 0
	}
	
	continueUntil (token, keepToken=false)
	{
		while(!this.getBuffer().endsWith(token)) {
			if(this.bindex + this.bsize == this.text.length) return null
			this.bsize++
		}
		return this.getBuffer(keepToken? 0 : -token.length)
	}
	
	deleteUntil (token)
	{
		let buffer = this.continueUntil(token)
		this.clear()
		return buffer
	}
	
	du (token) { this.deleteUntil(token); return this }
}
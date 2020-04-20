/// note: uses the following from schedule.js
/// const days = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa']

function promiseSchedule(classCodes, pfunc)
{
	const schedule = []
	const goal = classCodes.length
	let curr = 0
	
	if (goal == 0) { pfunc(''); return }
	
	for (let classCode of classCodes) {
		promiseClass(classCode, classes => {
			schedule.push(...classes)
			if (++curr == goal)
				pfunc(schedule)
		})
	}
}

function promiseClass(classCode, pfunc)
{
	scurl("https://louslist.org/sectiontip.php?ClassNumber=" + classCode, text => {
		const p = new Parser(text)
		const title = p.du('class="InfoClass">').du('class="InfoClass">').deleteUntil('<br')
		
		const tals = getTALs(p.du('class="InfoMeetings"'))
			.map(tal => ({
				title: title,
				loc: tal.loc,
				dows: tal.dows,
				start: tal.start,
				end: tal.end
			}))
		
		pfunc(tals)
	})
}

/* takes a Parser object that points to a louslist course page right after the first 'class="InfoMeetings"'
 * returns a list of TALs that represents that course
*/
function getTALs(p, times=[])
{	
	const timeStuff = p.du('</td><td>').deleteUntil("</td><td>").split(' ') // 'MoWeFr 9:00AM - 9:50AM' split by spaces

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

/* takes a 12-hour time string
 * returns a float that represents the time in hours (referred to as an HRT)
 * 
 * "8:30PM" -> 20.5
*/
function toHRT(text)
{
	const nums = text.match(/[0-9]+/g).map(n => Number(n))
	const ampm = text.toLowerCase().match(/am|pm/g)[0] === 'pm' ? 12 : 0
	
	return (ampm + nums[0] % 12) + nums[1] / 60
}

/* takes a url and a function
 * runs the function with the url's response text
*/
function scurl(url, cfunc)
{
	fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(url))
		.then(resp => resp.json())
		.then(json => cfunc(json.contents))
}

class Parser
{
	constructor(text, bindex, bsize)
	{
		this.text = text
		this.bindex = 0
		this.bsize = 0
	}
	
	getBuffer(offset=0)
	{
		return this.text.substring(this.bindex, this.bindex + this.bsize + offset)
	}
	
	reset()
	{
		this.bindex = this.bsize = 0
	}
	
	clear(keepBuffer=false)
	{
		if(!keepBuffer) this.bindex += this.bsize
		this.bsize = 0
	}
	
	continueUntil(token, keepToken=false)
	{
		while(!this.getBuffer().endsWith(token)) {
			if(this.bindex + this.bsize == this.text.length) return null
			this.bsize++
		}
		return this.getBuffer(keepToken? 0 : -token.length)
	}
	
	deleteUntil(token)
	{
		let buffer = this.continueUntil(token)
		this.clear()
		return buffer
	}
	
	du (token){
		this.deleteUntil(token)
		return this
	}
}
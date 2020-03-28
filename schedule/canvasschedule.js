const default_settings = {
	padding: 20,
	marginX: 50,
	marginY: 50,
	startHour: 8,
	endHour: 18,
	blockWidth: 100,
	blockHeight: 60,
	foreground: '#000',
	background: '#fff',
	textground: '#000',
	font: '12px Arial',
	guideOpacity: 0.1,
	lineHeight: 14,
	textPadding: 4,
	shortDays: 'mo,tu,we,th,fr',
	longDays: 'Mon,Tue,Wed,Thu,Fri',
	dowOffset: 1
}

class ScheduleCanvas
{
	constructor(canvasID, new_settings=default_settings)
	{
		let settings = default_settings
		
		for (let [k, v] of Object.entries(new_settings)) // there is probably a cleaner way to do this
			Reflect.set(settings, k, v)
		
		settings.longDays = settings.longDays.split(',')
		settings.shortDays = settings.shortDays.split(',')
		
		for (let [k, v] of Object.entries(settings))
			Reflect.set(this, k, v)

		this.canvas = document.getElementById(canvasID)
		this.c = this.canvas.getContext('2d')
		
		let can = this.canvas;
		let c = this.c;
		
		can.width = this.marginX + this.padding*2 + this.longDays.length*this.blockWidth
		can.height = this.marginY + this.padding*2 + (this.endHour - this.startHour + 1) * this.blockHeight

		c.globalAlpha = 1
		c.font = this.font
		c.strokeStyle = this.foreground
		c.textAlign = 'center'
		c.textBaseline = 'middle'

		this.clear()
	}

	clear()
	{
		this.c.fillStyle = this.background
		this.c.fillRect(0, 0, this.canvas.width, this.canvas.height)
	}

       drawSchedule(text)
            { window.requestAnimationFrame(() => this.drawScheduleCallback(parseSchedule(text))) }

	drawScheduleCallback(schedule)
	{
		this.clear()
		this.drawTimes()
		this.drawDOWLabels()
		this.drawLines()

		for (let item of schedule)
			for (let dow of item.dows)
				this.drawTextRect(
					item.title,
					this.marginX + (dow - this.dowOffset)*this.blockWidth,
					this.marginY + (item.start - this.startHour)*this.blockHeight,
					this.blockWidth,
					(item.end - item.start) * this.blockHeight
				)
	}

	drawTextRect(text, x, y, width, height, background=this.background, foreground=this.foreground, textground=this.textground)
	{
		this.c.strokeStyle = foreground
		this.c.fillStyle = background
		this.c.fillRect(x + this.padding, y + this.padding, width, height)
		this.c.strokeRect(x + this.padding, y + this.padding, width, height)
		this.c.fillStyle = textground;
		this.drawText(this.wrapText(text, width - this.textPadding*2), x + width/2, y + height/2)
	}

       wrapText(text, targetWidth)
            { let burrito
              let lines = ''
              while ((burrito = this.getWrap(text, targetWidth)).tail.length != 0)
                   { lines += burrito.head + '\n'
                     text = burrito.tail }
              lines += burrito.head
              return lines }

       getWrap(text, targetWidth)
            { let words = text.split(' ')
              for (let i=words.length; i>0; i--) // loops thru string backwards and finds words that fit in box
                   { let head = words.slice(0, i).join(' ')
                     if (this.c.measureText(head).width < targetWidth)
                            return { head: head, tail: words.slice(i, words.length).join(' ') } }
              return { head: '.', tail: '' } }

       drawText(text, centerX, centerY)
            { let lines = text.split('\n')
              centerY -= Math.floor(lines.length/2 + 1) * this.lineHeight + (lines.length%2 - 1) * this.lineHeight/2
              for (let line of lines)
                     this.c.fillText(line, centerX + this.padding, this.padding + (centerY += this.lineHeight)) }

       drawTimes()
            { for (let hour=this.startHour; hour<=this.endHour; hour++)
                   this.drawTextRect(hour + '', 0, this.marginY + (hour - this.startHour)*this.blockHeight, this.marginX, this.blockHeight) }

       drawDOWLabels()
            { for (let day=0; day<this.longDays.length; day++)
                   this.drawTextRect(this.longDays[day], this.marginX + day*this.blockWidth, 0, this.blockWidth, this.marginY ) }

       drawLines()
            { for (let hour=this.startHour+1; hour<=this.endHour; hour++)
                 { this.c.globalAlpha = this.guideOpacity
                   this.c.strokeRect(this.marginX + this.padding, this.marginY + this.padding + (hour - this.startHour)*this.blockHeight, this.canvas.width - this.marginY - this.padding*2, 0)
                   this.c.globalAlpha = 1 } } }

let ws = new WebSocket('ws://localhost:8035/staebe');

const sliderProperties = {
	delayFrame: { min: 0, max: 600, default: 599 },
	debugMode: { radio: ['showVideo', 'showDigits'], default: 'showVideo' },
	frameMode0: { radio: ['normal', 'delay', 'fall', 'blendtwo'], default: 'delay' },
	frameMode1: { radio: ['normal', 'delay', 'fall', 'blendtwo'], default: 'blendtwo' },
	blendTint: { min: 0, max: 1, default: 0.3 },
	blendMode: { radio: ['blend', 'lightest', 'darkest'], default: 'lightest' },
	tUpdate: { min: 1, max: 60, default: 30 },
	fader0: { min: 0, max: 255, default: 255 },
	fader1: { min: 0, max: 255, default: 255 },
};
const sliderValues = {};
for (const key in sliderProperties) {
	sliderValues[key] = sliderProperties[key].default;
}
const presets = [
	{
		name: 'blank',
		sliders: {
			fader0: { val: 0, t: 1 },
			fader1: { val: 0, t: 1 },
		}
	},
	{
		name: 'all',
		sliders: {
			fader0: { val: 255, t: 1 },
			fader1: { val: 255, t: 1 },
		}
	},
	{
		name: 'solo0',
		sliders: {
			fader0: { val: 255, t: 1 },
			fader1: { val: 0, t: 1 },
		}
	},
	{
		name: 'solo1',
		sliders: {
			fader0: { val: 0, t: 1 },
			fader1: { val: 255, t: 1 },
		}
	},
	{
		name: 'real-real',
		sliders: {
			frameMode0: { val: 'normal', t: 1 },
			frameMode1: { val: 'normal', t: 1 },
		}
	},
	{
		name: 'delay-blend',
		sliders: {
			frameMode0: { val: 'delay', t: 1 },
			frameMode1: { val: 'blendtwo', t: 1 },
		}
	},
	{
		name: 'fall-blend',
		sliders: {
			frameMode0: { val: 'fall', t: 1 },
			frameMode1: { val: 'blendtwo', t: 1 },
		}
	},
];

var gui = new dat.gui.GUI();
gui.remember(sliderValues);
for (let key of Object.keys(sliderValues)) {
	if (sliderProperties[key].min != undefined && sliderProperties[key].min != undefined) {
		gui.add(sliderValues, key).min(sliderProperties[key].min).max(sliderProperties[key].max).listen().onChange(function (value) {
			let params = { sliderValues };
			if (ws.readyState == WebSocket.OPEN) {
				ws.send(JSON.stringify(params));
			}
		});
	}
	else if (sliderProperties[key].radio != undefined) {
		gui.add(sliderValues, key, sliderProperties[key].radio).listen().onChange(function (value) {
			let params = { sliderValues };
			if (ws.readyState == WebSocket.OPEN) {
				ws.send(JSON.stringify(params));
			}
		});
	}
}
new Vue({
	el: '#radioContainer',
	data: {
		presets,
		checked: 'none',
	},
	watch: {
		checked: function (val) {
			const preset = presets.filter(obj => {
				return obj.name == val
			})[0];

			easeTo(preset);
		}
	}
});

function easeTo(preset) {
	for (const key in sliderProperties) {
		if (sliderProperties[key].radio != undefined) {
			setTimeout(() => {
				if (preset.sliders[key] == undefined) {
					// sliderValues[key] = sliderProperties[key].default;
				}
				else {
					sliderValues[key] = preset.sliders[key].val;
				}
			}, 0.5 * 1000)
		}
		else {
			if (preset.sliders[key] == undefined) {
				// let target = { ease: Power2.easeInOut };
				// target[key] = sliderProperties[key].default;
				// TweenLite.to(sliderValues, 1, target);
			}
			else {
				let target = { ease: Power2.easeInOut };
				target[key] = preset.sliders[key].val;
				if (preset.sliders[key].ease != undefined) {
					target.ease = preset.sliders[key].ease;
				}
				TweenLite.to(sliderValues, preset.sliders[key].t, target);
			}
		}
	}
	let count = 0;
	let maxCount = preset.duration * 1000 / 10;
	let interval = setInterval(function () {
		let params = { sliderValues };
		if (ws.readyState == WebSocket.OPEN) {
			ws.send(JSON.stringify(params));
		}
		count++;
		if (count >= maxCount) {
			clearInterval(interval);
		}
	}, 10);
}

ws.onopen = function (event) {
};

setInterval(() => {
	if (ws.readyState == WebSocket.CLOSED) {
		ws = new WebSocket('ws://localhost:8035/staebe');
	}
}, 1000)

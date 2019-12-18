let ws = new WebSocket('ws://localhost:8035/staebe');

const sliderProperties = {
	background: { min: 0, max: 255, default: 255 },
	delayFrame: { min: 0, max: 600, default: 0 },
	debugMode: { radio: ['showVideo', 'showDigits'], default: 'showVideo' },
	frameMode: { radio: ['normal', 'delay', 'random', 'noise', 'jump', 'fall', 'blendtwo'], default: 'normal' },
	blendTint: { min: 0, max: 1, default: 0.3 },
	blendMode: { radio: ['blend', 'lightest', 'darkest'], default: 'blend' },
	jumpRate: { min: 0, max: 1, default: 1 },
	tUpdate: { min: 1, max: 20, default: 5 },
	fader0: { min: 0, max: 255, default: 255 },
	fader3: { min: 0, max: 255, default: 255 },
};
const sliderValues = {};
for (const key in sliderProperties) {
	sliderValues[key] = sliderProperties[key].default;
}
const presets = [
	{
		name: 'blank',
		display: 'Blank',
		sliders: { background: { val: 255, t: 1 } }
	},
	{
		name: 'grid',
		display: 'Grid',
		sliders: {
			background: { val: 255, t: 1 },
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
		if (preset.sliders[key] == undefined) {
			let target = { ease: Power2.easeInOut };
			target[key] = sliderProperties[key].default;
			TweenLite.to(sliderValues, 1, target);
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

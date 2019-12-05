let ws = new WebSocket('ws://localhost:8035/staebe');

const sliderProperties = {
	background: { min: 0, max: 255, default: 255 },
	debugNumbers: { min: 0, max: 1.9999, default: 1 },
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
for (let key of Object.keys(sliderValues))
	gui.add(sliderValues, key).min(sliderProperties[key].min).max(sliderProperties[key].max).listen().onChange(function (value) {
		let params = { sliderValues };
		if (ws.readyState == WebSocket.OPEN) {
			ws.send(JSON.stringify(params));
		}
	});

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

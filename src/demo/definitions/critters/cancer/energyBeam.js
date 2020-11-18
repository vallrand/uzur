import { fastNoise, seamlessNoise } from '../../../../lib/algorithms'

export const energyBeam = `
varying vec2 uvPass;
uniform float time;

uniform float strength;
uniform vec3 fillColor;

const float PI = ${Math.PI};
const float TWO_PI = ${2 * Math.PI};

${fastNoise}
${seamlessNoise}

const float heatSize = 2.8;
const float heatOffset = 4.0;
const float heatSharpness = 0.8;
const float beamWidth = 6.0;
const float beamSpread = 2.0;
const float muzzleSize = 1.0;

vec4 colorify(in float depth, in vec3 color){
    float value = max(depth, 0.0);
    return vec4(pow(value, 2.0) * color, value);
}

void main(){
    vec2 uv = uvPass * vec2(2.0, 2.0) - vec2(1.5, 1.0);
	
    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);

    float heat = strength * heatOffset * (1.0 - length(strength * heatSize * uv));
    heat += octaveNoise(vec3(atan(uv.x,uv.y) / TWO_PI + 0.5, length(uv) * heatSharpness, 0.5) + vec3(0.0, -time * 0.005, time * 0.001));
    color += colorify(0.5 * heat, fillColor);

    float spread = beamSpread - 0.75 * beamSpread * uv.x;
    float width = beamWidth + 0.5 * beamWidth * (1.5 + uv.x);
    float beam = strength * spread * (1.0 - abs(strength * width * uv.y));
    beam += octaveNoise(vec3(uv.x, uv.y, 0.5) + vec3(time * 0.036, 0.0, -time * 0.001));
    beam *= clamp(0.5 - 2.0 * uv.x, 0.0, 1.0);
    color += colorify(0.5 * beam, fillColor);


    float distance = muzzleSize * length(uv);
    float angle = (atan(uv.y, uv.x) + PI) / (2.0 * PI);
    float rays = 0.25 + min(1.0, strength) * 0.5 * noise(vec2(time * 0.025, angle * 124.0));
    float muzzle = step(distance, rays) * smoothstep(0.0, 0.3, rays - distance);
    color += 0.64 * colorify(muzzle, strength * 2.0 * fillColor);
    color *= min(1.0, (strength - 0.2) / 0.8);
    gl_FragColor = color;
}`
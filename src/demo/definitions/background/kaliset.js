export const kaliset = `
varying vec2 uvPass;
uniform float time;

uniform vec3 backColor;
uniform vec3 frontColor;

#define iterations ${12}
#define volumetricSteps ${4}

const float saturation = 0.5;
const float brightness = 0.0015;
const float distanceFading = 0.84;

const float stepSize = 1.0 / float(volumetricSteps);
const float tile = 1.0;
const float zoom = 1.0;
const float fractalParameter = 0.74;

vec3 tilingFold(in vec3 position){
    return abs(vec3(tile)-mod(position, vec3(2.0 * tile)));
}

vec3 kaliset(in vec3 origin, in vec3 direction){
	float step = stepSize, fade= 1.0;
	vec3 volume = vec3(0.0);
	for(int r = 0; r < volumetricSteps; r++){
		vec3 position = origin + step * direction * 0.5;
		position = tilingFold(position);
		float distance = 0.0, average = 0.0;
		for(int i = 0; i < iterations; i++){
            position = abs(position) / dot(position, position) - fractalParameter;
            average += abs(length(position) - distance);
            distance = length(position);
		}
        average = pow(average, 3.0);
		volume += vec3(step, pow(step, 2.0), pow(step, 4.0)) * average * brightness * fade;
		fade *= distanceFading;
		step += stepSize;
	}
	volume = mix(vec3(length(volume)), volume, saturation);
    return volume;
}

void main(){
	vec3 direction = vec3(uvPass * zoom, -0.25);
	vec3 origin = vec3(0.001 * time, 0.0, -1.0);

    vec3 value = kaliset(origin, direction);
	
    vec3 color = mix(frontColor * value * 0.05, backColor, max(0.0, 2.0 * uvPass.y - 1.0));

	gl_FragColor = vec4(color, 1.0);
}`
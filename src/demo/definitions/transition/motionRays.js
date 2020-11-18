import { fastNoise } from '../../../lib/algorithms'

export const motionRays = `
varying vec2 uvPass;
uniform float time;

uniform vec3 leftColor;
uniform vec3 rightColor;
uniform vec2 centroid;

${fastNoise}

const float PI = ${Math.PI};
const float TAU = ${Math.TAU};
const int ITERATIONS = 20;

float easeIn(in float value){ return pow(value, 2.0); }

void main(){
	vec2 uv = 2.0 * uvPass - 2.0 * centroid;
    
	vec3 ray = vec3(uv, 1.0);

	float offset = time*.5 + PI;	
	float speed2 = (cos(offset)+1.0)*2.0;
	float speed = speed2+.1;
	offset += sin(offset)*.96;
	offset *= 2.0;
	
	
	vec4 color = vec4(0);
	
	vec3 step = ray/max(abs(ray.x),abs(ray.y));
	
	vec3 pos = 2.0*step+.5;
	for(int i=0; i < ITERATIONS; i++){
		float z = noise(floor(pos.xy));
		z = fract(z-offset);
		float d = 50.0*z-pos.z;
        d *= 1.0 - 0.2 * speed2;
        float width = 1.0 - 0.99 * 0.25 * speed;
		float w = pow(max(0.0,1.0-width*8.0*length(fract(pos.xy)-.5)),2.0);
		vec3 c = max(vec3(0),vec3(1.0-abs(d+speed2*.5)/speed,1.0-abs(d)/speed,1.0-abs(d-speed2*.5)/speed));
        vec4 col = c.r * vec4(leftColor, 0.75) + c.b * vec4(rightColor, 0.75);
		color += 1.5*(1.0-z)*col*w;
		pos += step;
    }
    color *= min(1.0, speed);

    color = mix(color, vec4(1.0, 1.0, 1.0, 1.0), easeIn(clamp((time - 2.0 * PI + TAU) / TAU, 0.0, 1.0)));
    color = mix(color, vec4(0.0, 0.0, 0.0, 1.0), clamp((time - 2.0 * PI + 0.2 * PI) / (0.2 * PI), 0.0, 1.0));
    color = mix(color, vec4(0.0, 0.0, 0.0, 0.0), clamp((time - 2.0 * PI) / TAU, 0.0, 1.0));

	gl_FragColor = color;
}`
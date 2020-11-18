const premultipliedAlpha = false

export const colorFilter = {
    frag: `
varying vec2 uvPass;
uniform sampler2D sampler;
uniform vec2 invResolution;

uniform float colorMatrix[20];

void main(){
    vec4 color = texture2D(sampler, uvPass);
    
    ${premultipliedAlpha ? 'if (color.a > 0.0) color.rgb /= color.a;' : ''}

    color = vec4(
        colorMatrix[0] * color.r + colorMatrix[1] * color.g + colorMatrix[2] * color.b + colorMatrix[3] * color.a + colorMatrix[4],
        colorMatrix[5] * color.r + colorMatrix[6] * color.g + colorMatrix[7] * color.b + colorMatrix[8] * color.a + colorMatrix[9],
        colorMatrix[10] * color.r + colorMatrix[11] * color.g + colorMatrix[12] * color.b + colorMatrix[13] * color.a + colorMatrix[14],
        colorMatrix[15] * color.r + colorMatrix[16] * color.g + colorMatrix[17] * color.b + colorMatrix[18] * color.a + colorMatrix[19]
    );

    ${premultipliedAlpha ? 'color.rgb *= color.a;' : ''}

    gl_FragColor = color;    
}`
}
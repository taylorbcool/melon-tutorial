precision {{= ctx.precision }} float;


// Uniforms

/**
 * 2D texture sampler array
 * Maximum number of textures is determined at compile-time
 * @ignore
 */
uniform sampler2D uSampler[{{= ctx.maxTextures }}];


// Varyings

/**
 * Fragment color
 * @ignore
 */
varying vec4 vColor;

/**
 * Fragment texture unit index
 * @ignore
 */
varying float vTexture;

/**
 * Fragment texture coordinates
 * @ignore
 */
varying vec2 vRegion;


void main(void) {
    // Convert texture unit index to integer
    int texture = int(vTexture);

    /*
     * Dynamically indexing arrays in a fragment shader is not allowed:
     *
     * https://www.khronos.org/registry/webgl/specs/1.0/#4.3
     *
     * "
     *  Appendix A mandates certain forms of indexing of arrays; for example,
     *  within fragment shaders, indexing is only mandated with a
     *  constant-index-expression (see [GLES20GLSL] for the definition of this
     *  term). In the WebGL API, only the forms of indexing mandated in
     *  Appendix A are supported.
     * "
     *
     * And GLES20GLSL has this to say about constant-index-expressions:
     *
     * "
     *  constant-index-expressions are a superset of constant-expressions.
     *  Constant-index-expressions can include loop indices as defined in
     *  Appendix A section 4.
     *
     *  The following are constant-index-expressions:
     *    * Constant expressions
     *    * Loop indices as defined in section 4
     *    * Expressions composed of both of the above
     * "
     *
     * To workaround this issue, we create a long if-then-else statement using
     * a template processor; the number of branches depends only on the total
     * number of texture units supported by the WebGL implementation.
     *
     * The number of available texture units is at least 8, but can be as high
     * as 32 (as of 2016-01); source: http://webglstats.com/
     * See: MAX_TEXTURE_IMAGE_UNITS
     *
     * The idea of sampler selection originated from work by Kenneth Russell and
     * Nat Duca from the Chromium Team.
     * See: http://webglsamples.org/sprites/readme.html
     */
    if (texture == 0) {
        gl_FragColor = texture2D(uSampler[0], vRegion) * vColor;
    }
{{ for (var i = 1; i < ctx.maxTextures - 1; i++) { }}
    else if (texture == {{= i }}) {
        gl_FragColor = texture2D(uSampler[{{= i }}], vRegion) * vColor;
    }
{{ } }}
    else {
        gl_FragColor = texture2D(uSampler[{{= ctx.maxTextures - 1 }}], vRegion) * vColor;
    }
}

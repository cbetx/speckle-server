import { speckleDisplaceVert } from './shaders/speckle-displace.vert'
import { speckleDisplaceFrag } from './shaders/speckle-displace-frag'
import { Vector2 } from 'three'
import SpeckleBasicMaterial from './SpeckleBasicMaterial'
import { Uniforms } from './SpeckleMaterial'

class SpeckleDisplaceMaterial extends SpeckleBasicMaterial {
  protected get vertexProgram(): string {
    return speckleDisplaceVert
  }

  protected get fragmentProgram(): string {
    return speckleDisplaceFrag
  }

  protected get uniformsDef(): Uniforms {
    return { ...super.uniformsDef, size: new Vector2(), displacement: 0 }
  }

  constructor(parameters, defines = ['USE_RTE']) {
    super(parameters, defines)
  }
}

export default SpeckleDisplaceMaterial

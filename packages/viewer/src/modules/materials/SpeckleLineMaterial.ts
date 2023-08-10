/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable camelcase */
import { speckleLineVert } from './shaders/speckle-line-vert'
import { speckleLineFrag } from './shaders/speckle-line-frag'
import { ShaderLib, Vector3, IUniform, Material } from 'three'
import { Matrix4 } from 'three'
import { Geometry } from '../converter/Geometry'
import { ExtendedLineMaterial, Uniforms } from './SpeckleMaterial'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'

class SpeckleLineMaterial extends ExtendedLineMaterial {
  private static readonly matBuff: Matrix4 = new Matrix4()
  private static readonly vecBuff0: Vector3 = new Vector3()
  private static readonly vecBuff1: Vector3 = new Vector3()
  private static readonly vecBuff2: Vector3 = new Vector3()

  protected get vertexProgram(): string {
    return speckleLineVert
  }

  protected get fragmentProgram(): string {
    return speckleLineFrag
  }

  protected get baseUniforms(): { [uniform: string]: IUniform } {
    return ShaderLib['line'].uniforms
  }

  protected get uniformsDef(): Uniforms {
    return {
      uViewer_high: new Vector3(),
      uViewer_low: new Vector3(),
      pixelThreshold: 0
    }
  }

  public set pixelThreshold(value: number) {
    this.userData.pixelThreshold.value = value
    this.needsUpdate = true
  }

  constructor(parameters, defines = ['USE_RTE']) {
    super(parameters)
    this.init(defines)
  }

  /** We need a unique key per program */
  public customProgramCacheKey() {
    return this.constructor.name
  }

  public copy(source) {
    super.copy(source)
    this.copyFrom(source)
    return this
  }

  public fastCopy(from: Material, to: Material) {
    super.fastCopy(from, to)
    const toStandard = to as LineMaterial
    const fromStandard = from as LineMaterial
    toStandard.color.copy(fromStandard.color)
  }

  onBeforeRender(_this, scene, camera, geometry, object, group) {
    SpeckleLineMaterial.matBuff.copy(camera.matrixWorldInverse)
    SpeckleLineMaterial.matBuff.elements[12] = 0
    SpeckleLineMaterial.matBuff.elements[13] = 0
    SpeckleLineMaterial.matBuff.elements[14] = 0
    // SpeckleLineMaterial.matBuff.multiply(object.matrixWorld)
    object.modelViewMatrix.copy(SpeckleLineMaterial.matBuff)

    SpeckleLineMaterial.vecBuff0.set(
      camera.matrixWorld.elements[12],
      camera.matrixWorld.elements[13],
      camera.matrixWorld.elements[14]
    )

    Geometry.DoubleToHighLowVector(
      SpeckleLineMaterial.vecBuff0,
      SpeckleLineMaterial.vecBuff1,
      SpeckleLineMaterial.vecBuff2
    )
    this.userData.uViewer_low.value.copy(SpeckleLineMaterial.vecBuff1)
    this.userData.uViewer_high.value.copy(SpeckleLineMaterial.vecBuff2)
    _this.getDrawingBufferSize(this.resolution)
    this.needsUpdate = true
  }
}

export default SpeckleLineMaterial

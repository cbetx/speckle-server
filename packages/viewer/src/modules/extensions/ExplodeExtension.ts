import { Vector3 } from 'three'
import { Extension } from './core-extensions/Extension'

export class ExplodeExtension extends Extension {
  private explodeTime = -1
  private explodeRange = 0

  public onLateUpdate() {
    if (this.explodeTime > -1) {
      this.explode(this.explodeTime, this.explodeRange)
      this.explodeTime = -1
    }
  }
  public setExplode(time: number) {
    const size = this.viewer.World.worldSize
    this.explodeTime = time
    this.explodeRange = Math.sqrt(size.x * size.x + size.y * size.y + size.z * size.z)
  }

  private explode(time: number, range: number) {
    const objects = this.viewer.getRenderer().getObjects()
    const vecBuff = new Vector3()
    for (let i = 0; i < objects.length; i++) {
      const center = objects[i].renderView.aabb.getCenter(vecBuff)
      const dir = center.sub(this.viewer.World.worldOrigin)
      dir.normalize().multiplyScalar(time * range)

      objects[i].transformTRS(dir, undefined, undefined, undefined)
    }

    // this.renderer.shadowMap.needsUpdate = true
    this.viewer.requestRender()
  }
}
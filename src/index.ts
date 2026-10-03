import { 
  engine, 
  Transform, 
  MeshRenderer, 
  PointerEvents, 
  PointerEventType, 
  InputAction
} from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'
import { ReactEcsRenderer } from '@dcl/sdk/react-ecs'
import { renderUserInterfaceHUD, isIdeaCardVisible, currentInteractingDev } from './ui'

export function main() {
  // Initialize user interface HUD render layers
  ReactEcsRenderer.setUiRenderer(renderUserInterfaceHUD)

  // Base Matte Floor Mesh Structure Setup covering the parcel bounds
  const structuralFloorContainer = engine.addEntity()
  Transform.create(structuralFloorContainer, {
    position: Vector3.create(16, 0, 16),
    scale: Vector3.create(32, 0.1, 32)
  })
  MeshRenderer.setBox(structuralFloorContainer)

  // Position matrix arrays for modern shared interactive tables objects
  const tablePositions = [
    Vector3.create(10, 0.5, 12),
    Vector3.create(22, 0.5, 18),
    Vector3.create(16, 0.5, 25)
  ]
  const randomDevNames = ["Dev_Alpha", "Dev_Octocat", "Dev_Coder99"]

  tablePositions.forEach((positionMatrix, index) => {
    const interactionTableEntity = engine.addEntity()
    Transform.create(interactionTableEntity, {
      position: positionMatrix,
      scale: Vector3.create(2.5, 0.75, 1.8)
    })
    MeshRenderer.setBox(interactionTableEntity)

    // Append Pointer Event click sensors triggers onto table nodes meshes
    PointerEvents.create(interactionTableEntity, {
      pointerEvents: [
        {
          eventType: PointerEventType.PET_DOWN,
          eventInfo: {
            button: InputAction.IA_POINTER,
            hoverText: "Click to share architectural idea code module"
          }
        }
      ]
    })

    // Listeners captures triggers response logic for table interactions elements
    engine.addSystem(() => {
      const interactionEventResult = PointerEvents.getMutable(interactionTableEntity)
      if (interactionEventResult && interactionEventResult.pointerEvents) {
        currentInteractingDev.name = randomDevNames[index]
        isIdeaCardVisible.value = true
      }
    })
  })

  // Render alternative active developers tracking pointers as 3D cylinders shapes
  const pointerCoordinatesTracks = [
    Vector3.create(12, 1.8, 14),
    Vector3.create(18, 2.2, 16),
    Vector3.create(15, 1.9, 22)
  ]

  pointerCoordinatesTracks.forEach((coordinate) => {
    const alternativeCursorEntity = engine.addEntity()
    Transform.create(alternativeCursorEntity, {
      position: coordinate,
      scale: Vector3.create(0.4, 0.4, 0.4),
      rotation: Quaternion.fromEulerDegrees(45, 0, 15)
    })
    MeshRenderer.setCylinder(alternativeCursorEntity)
  })
}

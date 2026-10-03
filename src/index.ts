import { 
  engine, 
  executeTask, 
  Transform, 
  MeshRenderer, 
  PointerEvents, 
  PointerEventType, 
  InputAction,
  Entity
} from '@dcl/sdk/ecs'
import { Color4, Vector3, Quaternion } from '@dcl/sdk/math'
import ReactEcs, { ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'

// Global states variables
let selectedEnvironmentMap = "lobby-room"
let activeModalMessage = ""
let isIdeaCardVisible = false
let currentInteractingDev = "Dev_Guest"

// 1. Setup Random Map Allocation (Sorteio Inicial de Ambiente do Metaverso)
const structuralMaps = ["lobby-room", "repository-hub", "agile-board"]
selectedEnvironmentMap = structuralMaps[Math.floor(Math.random() * structuralMaps.length)]

// 2. Setup HUD Overlay Interface (GitHub Multiverse Head-Up Display Layout)
const renderUserInterfaceHUD = () => (
  <UiEntity
    uiTransform={{
      width: '100%',
      height: '100%',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: { top: 20, left: 24, right: 24 }
    }}
  >
    {/* Left Panel Header Titles */}
    <UiEntity
      uiTransform={{ flexDirection: 'column' }}
    >
      <UiEntity
        uiText={{ 
          value: "GitHub Multiverse", 
          fontSize: 24, 
          color: Color4.fromHexString("#0366d6"),
          font: 'monospace',
          textAlign: 'middle-left'
        }}
      />
      <UiEntity
        uiText={{ 
          value: `Active Room Map: ${selectedEnvironmentMap.toUpperCase()}`, 
          fontSize: 12, 
          color: Color4.fromHexString("#586069"),
          font: 'sans-serif'
        }}
        uiTransform={{ margin: { top: 4 } }}
      />
    </UiEntity>

    {/* Right Panel Navigation Workspace Actions Control Buttons */}
    <UiEntity
      uiTransform={{ flexDirection: 'row', alignItems: 'center' }}
    >
      <UiEntity
        uiTransform={{ width: 110, height: 36, margin: { right: 10 } }}
        uiBackground={{ color: Color4.fromHexString("#2ea44f") }}
        uiText={{ value: "Invite peers", fontSize: 13, color: Color4.White() }}
        onMouseDown={() => { console.log("Invite triggered") }}
      />
      <UiEntity
        uiTransform={{ width: 130, height: 36, margin: { right: 10 } }}
        uiBackground={{ color: Color4.fromHexString("#0366d6") }}
        uiText={{ value: "Create new lobby", fontSize: 13, color: Color4.White() }}
        onMouseDown={() => { console.log("Lobby creation requested") }}
      />
      <UiEntity
        uiTransform={{ width: 80, height: 36 }}
        uiBackground={{ color: Color4.fromHexString("#24292e") }}
        uiText={{ value: "Chat", fontSize: 13, color: Color4.White() }}
        onMouseDown={() => { console.log("Chat system activation") }}
      />
    </UiEntity>

    {/* Dynamic Collaborative Interacting Idea Share Modal Card popup */}
    {isIdeaCardVisible && (
      <UiEntity
        uiTransform={{
          positionType: 'absolute',
          position: { top: '40%', left: '35%' },
          width: 400,
          height: 160,
          flexDirection: 'column',
          padding: 20
        }}
        uiBackground={{ color: Color4.fromHexString("#ffffff"), texturePixelValues: undefined }}
      >
        <UiEntity
          uiText={{ 
            value: `${currentInteractingDev} has an idea to share!`, 
            fontSize: 16, 
            color: Color4.fromHexString("#24292e"),
            font: 'sans-serif',
            textAlign: 'middle-center'
          }}
        />
        <UiEntity
          uiTransform={{ width: 100, height: 30, margin: { top: 30 }, alignSelf: 'center' }}
          uiBackground={{ color: Color4.fromHexString("#0366d6") }}
          uiText={{ value: "Close", fontSize: 12, color: Color4.White() }}
          onMouseDown={() => { isIdeaCardVisible = false }}
        />
      </UiEntity>
    )}
  </UiEntity>
)

ReactEcsRenderer.setUiRenderer(renderUserInterfaceHUD)

// 3. Engine Environment Architecture Meshes Generation (Instanciação de Cenários e Mesas)
export function main() {
  // Base Matte Floor Mesh Structure Setup covering the 2x2 Parcels Grid bounds
  const structuralFloorContainer = engine.addEntity()
  Transform.create(structuralFloorContainer, {
    position: Vector3.create(16, 0, 16),
    scale: Vector3.create(32, 0.1, 32)
  })
  MeshRenderer.setBox(structuralFloorContainer)

  // Generate Modern Interacting Shared Tables across the selected room boundaries
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

    // Append Pointer Event click sensors triggers onto the table nodes meshes
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

    // Listeners captures response logic for table interactions elements triggers
    engine.addSystem(() => {
      const interactionEventResult = PointerEvents.getMutable(interactionTableEntity)
      if (interactionEventResult.pointerEvents[0].eventInfo.showFeedback === false) {
        currentInteractingDev = randomDevNames[index]
        isIdeaCardVisible = true
        interactionEventResult.pointerEvents[0].eventInfo.showFeedback = true 
      }
    })
  })

  // 4. Render Alternative Developers Active Floating Pointers (Cursores 3D dos outros participantes)
  const pointerCoordinatesTracks = [
    Vector3.create(12, 1.8, 14),
    Vector3.create(18, 2.2, 16),
    Vector3.create(15, 1.9, 22)
  ]

  const pointerColorsPalette = [
    Color4.fromHexString("#2ea44f"),
    Color4.fromHexString("#ea4aaa"),
    Color4.fromHexString("#ffd33d")
  ]

  pointerCoordinatesTracks.forEach((coordinate, pointerIndex) => {
    const alternativeCursorEntity = engine.addEntity()
    Transform.create(alternativeCursorEntity, {
      position: coordinate,
      scale: Vector3.create(0.4, 0.4, 0.4),
      rotation: Quaternion.fromEulerDegrees(45, 0, 15)
    })
    
    // Creating realistic 3D Cones meshes mapping mouse actions tracks pointer displacements elements
    MeshRenderer.setCylinder(alternativeCursorEntity)
  })
}

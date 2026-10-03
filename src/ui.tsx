import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'

// Global states variables for environment rooms configuration
export let selectedEnvironmentMap = "lobby-room"
export let isIdeaCardVisible = { value: false }
export let currentInteractingDev = { name: "Dev_Guest" }

// Setup Random Map Allocation on init
const structuralMaps = ["lobby-room", "repository-hub", "agile-board"]
selectedEnvironmentMap = structuralMaps[Math.floor(Math.random() * structuralMaps.length)]

export const renderUserInterfaceHUD = () => (
  <UiEntity
    uiTransform={{
      width: '100%',
      height: '100%',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: { top: 20, left: 24, right: 24 }
    }}
  >
    {/* Left Panel Title Details */}
    <UiEntity uiTransform={{ flexDirection: 'column' }}>
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

    {/* Right Panel Navigation Workspace Control Buttons */}
    <UiEntity uiTransform={{ flexDirection: 'row', alignItems: 'center' }}>
      <UiEntity
        uiTransform={{ width: 110, height: 36, margin: { right: 10 } }}
        uiBackground={{ color: Color4.fromHexString("#2ea44f") }}
        uiText={{ value: "Invite peers", fontSize: 13, color: Color4.White() }}
      />
      <UiEntity
        uiTransform={{ width: 130, height: 36, margin: { right: 10 } }}
        uiBackground={{ color: Color4.fromHexString("#0366d6") }}
        uiText={{ value: "Create new lobby", fontSize: 13, color: Color4.White() }}
      />
      <UiEntity
        uiTransform={{ width: 80, height: 36 }}
        uiBackground={{ color: Color4.fromHexString("#24292e") }}
        uiText={{ value: "Chat", fontSize: 13, color: Color4.White() }}
      />
    </UiEntity>

    {/* Dynamic Collaborative Interacting Idea Share Modal Card popup */}
    {isIdeaCardVisible.value && (
      <UiEntity
        uiTransform={{
          positionType: 'absolute',
          position: { top: '40%', left: '35%' },
          width: 400,
          height: 160,
          flexDirection: 'column',
          padding: 20
        }}
        uiBackground={{ color: Color4.fromHexString("#ffffff") }}
      >
        <UiEntity
          uiText={{ 
            value: `${currentInteractingDev.name} has an idea to share!`, 
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
          onMouseDown={() => { isIdeaCardVisible.value = false }}
        />
      </UiEntity>
    )}
  </UiEntity>
)

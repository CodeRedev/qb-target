
local resourceName = GetCurrentResourceName()
local commandName = Config.StudioCommand or 'targetstyle'
local studioOpen = false

local function OpenStudio()
	if studioOpen then return end
	if not LocalPlayer.state['isLoggedIn'] then return end

	studioOpen = true

	-- Stop the target from opening while the panel is up.
	-- This also closes the target if it is currently active.
	exports[resourceName]:AllowTargeting(false)
	Wait(150)

	SetNuiFocus(true, true)
	SendNUIMessage({ response = 'openStudio' })
end

local function CloseStudio()
	if not studioOpen then return end

	studioOpen = false
	SetNuiFocus(false, false)
	exports[resourceName]:AllowTargeting(true)
end

exports('OpenStudio', function()
	CreateThread(OpenStudio)
end)

RegisterCommand(commandName, function()
	CreateThread(OpenStudio)
end, false)

RegisterNUICallback('closeStudio', function(_, cb)
	CloseStudio()
	cb('ok')
end)

AddEventHandler('onResourceStop', function(resource)
	if resource ~= resourceName then return end
	if studioOpen then
		SetNuiFocus(false, false)
	end
end)

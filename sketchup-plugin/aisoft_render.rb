# AIsoft Render SketchUp Extension Loader
require 'sketchup.rb'
require 'extensions.rb'

module AIsoftRender
  unless file_loaded?(__FILE__)
    ex = SketchupExtension.new('AIsoft Render AI', 'aisoft_render/main.rb')
    ex.description = 'AI-powered photorealistic rendering directly from your SketchUp viewport.'
    ex.version     = '1.0.0'
    ex.copyright   = 'AIsoft 2026'
    ex.creator     = 'AIsoft Team'
    Sketchup.register_extension(ex, true)
    file_loaded?(__FILE__)
  end
end

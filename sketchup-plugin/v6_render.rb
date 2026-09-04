# V6 Render SketchUp Extension Loader
require 'sketchup.rb'
require 'extensions.rb'

module V6Render
  unless file_loaded?(__FILE__)
    ex = SketchupExtension.new('V6 Render', 'v6_render/main.rb')
    ex.description = 'Photorealistic rendering directly from your SketchUp viewport.'
    ex.version     = '1.0.0'
    ex.copyright   = 'V6 Render 2026'
    ex.creator     = 'V6 Render'
    Sketchup.register_extension(ex, true)
    file_loaded?(__FILE__)
  end
end

# AIsoft Render SketchUp Extension Main Script
require 'sketchup.rb'
require 'base64'
require 'tmpdir'
require 'json'

module AIsoftRender
  class << self
    def show_dialog
      if @dialog && @dialog.visible?
        @dialog.bring_to_front
        return
      end

      options = {
        :dialog_title => "AIsoft Render AI",
        :preferences_key => "com.aisoft.render",
        :scrollable => true,
        :resizable => true,
        :width => 920,
        :height => 820,
        :style => UI::HtmlDialog::STYLE_DIALOG
      }

      @dialog = UI::HtmlDialog.new(options)
      html_path = File.join(__dir__, 'dialog.html')
      @dialog.set_file(html_path)

      # Action callback from JS to capture SketchUp screen
      @dialog.add_action_callback("capture_viewport") do |action_context|
        capture_and_send_to_js
      end

      @dialog.show
    end

    def capture_and_send_to_js
      view = Sketchup.active_model.active_view
      
      # Use exact active viewport width and height to preserve perspective & aspect ratio
      width = view.vpwidth > 0 ? view.vpwidth : 1280
      height = view.vpheight > 0 ? view.vpheight : 720

      temp_image_path = File.join(Dir.tmpdir, "sketchup_view_#{Time.now.to_i}.png")

      success = view.write_image(
        filename: temp_image_path,
        width: width,
        height: height,
        antialias: true,
        transparent: false
      )

      unless success && File.exist?(temp_image_path)
        err_json = { "success" => false, "error" => "Failed to capture SketchUp screen." }.to_json
        @dialog.execute_script("onViewportCaptured(#{err_json})")
        return
      end

      # Encode to Base64
      image_bytes = File.binread(temp_image_path)
      base64_str = "data:image/png;base64," + Base64.strict_encode64(image_bytes)

      # Cleanup temp file
      File.delete(temp_image_path) rescue nil

      # Send base64 back to JavaScript UI
      payload = { 
        "success" => true, 
        "image" => base64_str,
        "width" => width,
        "height" => height
      }.to_json
      @dialog.execute_script("onViewportCaptured(#{payload})")
    rescue => e
      err_json = { "success" => false, "error" => e.message }.to_json
      @dialog.execute_script("onViewportCaptured(#{err_json})")
    end
  end

  # Create Toolbar and Menu Entry in SketchUp
  unless file_loaded?(__FILE__)
    menu = UI.menu('Plugins')
    menu.add_item('AIsoft Render AI') {
      AIsoftRender.show_dialog
    }

    tb = UI::Toolbar.new("AIsoft Render")
    cmd = UI::Command.new("AIsoft Render AI") {
      AIsoftRender.show_dialog
    }
    cmd.tooltip = "Render active SketchUp viewport with AIsoft AI"
    cmd.status_bar_text = "Generate photorealistic rendering using AIsoft AI"
    tb.add_item(cmd)
    tb.show if tb.respond_to?(:show)

    file_loaded?(__FILE__)
  end
end

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

      # Remote-First Auto-Updating UI Architecture:
      # Loads live UI directly from Vercel so any code/UI changes update instantly without re-installing .rbz!
      remote_url = "https://pugin-five.vercel.app/plugin.html"
      html_path = File.join(__dir__, 'dialog.html')

      begin
        @dialog.set_url(remote_url)
      rescue => e
        @dialog.set_file(html_path)
      end

      # Action callback from JS to capture SketchUp screen
      @dialog.add_action_callback("capture_viewport") do |action_context|
        capture_and_send_to_js
      end

      @dialog.show
    end

    def capture_and_send_to_js
      view = Sketchup.active_model.active_view
      
      # Use exact active viewport width and height scaled to max 1536px to preserve aspect ratio while preventing oversized payloads
      raw_w = view.vpwidth > 0 ? view.vpwidth : 1280
      raw_h = view.vpheight > 0 ? view.vpheight : 720

      max_dim = 1536.0
      scale = [max_dim / raw_w, max_dim / raw_h, 1.0].min
      width = (raw_w * scale).round
      height = (raw_h * scale).round

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

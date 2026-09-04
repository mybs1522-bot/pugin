# V6 Render SketchUp Extension Main Script
require 'sketchup.rb'
require 'base64'
require 'tmpdir'
require 'json'

module V6Render
  class << self
    def show_dialog
      if @dialog && @dialog.visible?
        @dialog.bring_to_front
        return
      end

      options = {
        :dialog_title => "V6 Render",
        :preferences_key => "com.v6.render",
        :scrollable => true,
        :resizable => true,
        :width => 920,
        :height => 820,
        :style => UI::HtmlDialog::STYLE_DIALOG
      }

      @dialog = UI::HtmlDialog.new(options)

      # Remote-First Auto-Updating UI Architecture:
      # Loads live UI directly from Vercel so any code/UI changes update instantly without re-installing .rbz!
      remote_url = "https://pugin-five.vercel.app/plugin.html?v=#{Time.now.to_i}"
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

      # Action callback from JS to open URLs in user's default external browser
      @dialog.add_action_callback("open_external_url") do |action_context, url|
        UI.openURL(url.to_s) if url && !url.to_s.empty?
      end

      @dialog.show
    end

    def capture_and_send_to_js
      model = Sketchup.active_model
      view = model ? model.active_view : nil
      
      unless view
        err_json = { "success" => false, "error" => "No active SketchUp model view available." }.to_json
        @dialog.execute_script("onViewportCaptured(#{err_json})")
        return
      end

      # Force SketchUp graphics pipeline to flush and redraw the latest camera view
      view.invalidate rescue nil
      view.refresh rescue nil

      # Use exact active viewport width and height scaled to max 1536px to preserve aspect ratio
      raw_w = view.vpwidth > 0 ? view.vpwidth : 1280
      raw_h = view.vpheight > 0 ? view.vpheight : 720

      max_dim = 1536.0
      scale = [max_dim / raw_w, max_dim / raw_h, 1.0].min
      width = (raw_w * scale).round
      height = (raw_h * scale).round

      temp_image_path = File.join(Dir.tmpdir, "sketchup_view_#{Time.now.to_f.to_s.gsub('.', '_')}.jpg")

      success = view.write_image(
        filename: temp_image_path,
        width: width,
        height: height,
        antialias: true,
        compression: 0.92,
        transparent: false
      )

      unless success && File.exist?(temp_image_path)
        err_json = { "success" => false, "error" => "Failed to capture SketchUp screen." }.to_json
        @dialog.execute_script("onViewportCaptured(#{err_json})")
        return
      end

      # Encode to Base64 (Lightweight JPG < 500KB)
      image_bytes = File.binread(temp_image_path)
      base64_str = "data:image/jpeg;base64," + Base64.strict_encode64(image_bytes)

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
    menu.add_item('V6 Render') {
      V6Render.show_dialog
    }

    tb = UI::Toolbar.new("V6 Render")
    cmd = UI::Command.new("V6 Render") {
      V6Render.show_dialog
    }
    cmd.small_icon = File.join(__dir__, 'icon-32.png')
    cmd.large_icon = File.join(__dir__, 'icon-64.png')
    cmd.tooltip = "Render active SketchUp viewport with V6 Render"
    cmd.status_bar_text = "Generate photorealistic rendering from SketchUp"
    tb.add_item(cmd)
    tb.show if tb.respond_to?(:show)

    file_loaded?(__FILE__)
  end
end

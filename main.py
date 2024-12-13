import tkinter as tk
from tkinter import ttk
import speech_recognition as sr
from threading import Thread
import queue
import time

class SpeechRecognizerGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Voice Assistant")
        self.root.geometry("600x400")
        self.root.configure(bg="#2C3E50")
        
        self.setup_gui()
        self.recognizer = sr.Recognizer()
        self.is_listening = False
        self.message_queue = queue.Queue()
        
    def setup_gui(self):
        # Main container
        main_frame = ttk.Frame(self.root)
        main_frame.pack(padx=20, pady=20, fill=tk.BOTH, expand=True)
        
        # Style configuration
        style = ttk.Style()
        style.configure("Custom.TButton",
                       padding=10,
                       font=("Helvetica", 12))
        
        # Title
        title_label = ttk.Label(
            main_frame,
            text="🎤 Voice Recognition Assistant",
            font=("Helvetica", 24),
            justify="center"
        )
        title_label.pack(pady=20)
        
        # Text display area
        self.text_area = tk.Text(
            main_frame,
            height=10,
            width=50,
            font=("Helvetica", 12),
            wrap=tk.WORD,
            bg="#ECF0F1",
            fg="#2C3E50"
        )
        self.text_area.pack(pady=20)
        
        # Status label
        self.status_label = ttk.Label(
            main_frame,
            text="Status: Ready",
            font=("Helvetica", 10)
        )
        self.status_label.pack(pady=10)
        
        # Button frame
        button_frame = ttk.Frame(main_frame)
        button_frame.pack(pady=20)
        
        # Control buttons
        self.listen_button = ttk.Button(
            button_frame,
            text="Start Listening",
            command=self.toggle_listening,
            style="Custom.TButton"
        )
        self.listen_button.pack(side=tk.LEFT, padx=10)
        
        self.clear_button = ttk.Button(
            button_frame,
            text="Clear Text",
            command=self.clear_text,
            style="Custom.TButton"
        )
        self.clear_button.pack(side=tk.LEFT, padx=10)
        
        # Animation canvas
        self.canvas = tk.Canvas(
            main_frame,
            width=200,
            height=40,
            bg="#2C3E50",
            highlightthickness=0
        )
        self.canvas.pack(pady=10)
        self.setup_animation()
        
    def setup_animation(self):
        self.bars = []
        bar_width = 4
        gap = 6
        num_bars = 20
        
        for i in range(num_bars):
            x = 40 + i * (bar_width + gap)
            height = 5
            bar = self.canvas.create_rectangle(
                x, 20 - height/2,
                x + bar_width, 20 + height/2,
                fill="#3498DB"
            )
            self.bars.append(bar)
            
    def animate_bars(self):
        if self.is_listening:
            for bar in self.bars:
                height = 5 + 30 * abs(time.time() % 1 - 0.5)
                x1, _, x2, _ = self.canvas.coords(bar)
                self.canvas.coords(
                    bar,
                    x1, 20 - height/2,
                    x2, 20 + height/2
                )
            self.root.after(50, self.animate_bars)
        else:
            for bar in self.bars:
                self.canvas.coords(
                    bar,
                    *self.canvas.coords(bar)[:2],
                    self.canvas.coords(bar)[2],
                    self.canvas.coords(bar)[1] + 5
                )
                
    def toggle_listening(self):
        if not self.is_listening:
            self.is_listening = True
            self.listen_button.configure(text="Stop Listening")
            self.status_label.configure(text="Status: Listening...")
            Thread(target=self.listen_for_speech).start()
            self.animate_bars()
            self.check_queue()
        else:
            self.is_listening = False
            self.listen_button.configure(text="Start Listening")
            self.status_label.configure(text="Status: Stopped")
            
    def listen_for_speech(self):
        while self.is_listening:
            try:
                with sr.Microphone() as source:
                    self.recognizer.adjust_for_ambient_noise(source)
                    audio = self.recognizer.listen(source, timeout=1)
                    try:
                        text = self.recognizer.recognize_google(audio)
                        self.message_queue.put(text)
                    except sr.UnknownValueError:
                        pass
                    except sr.RequestError:
                        self.message_queue.put("Sorry, there was an error with the speech service")
            except Exception as e:
                print(f"Error: {str(e)}")
                
    def check_queue(self):
        try:
            while True:
                text = self.message_queue.get_nowait()
                self.text_area.insert(tk.END, text + "\n")
                self.text_area.see(tk.END)
        except queue.Empty:
            pass
        if self.is_listening:
            self.root.after(100, self.check_queue)
            
    def clear_text(self):
        self.text_area.delete(1.0, tk.END)

if __name__ == "__main__":
    root = tk.Tk()
    app = SpeechRecognizerGUI(root)
    root.mainloop()

using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

class Program {
    static async Task Main() {
        var _httpClient = new HttpClient();
        var key = "AQ.Ab8RN6LUU7rPtjvLAnROCIRYhPjiRjpx-QXsW_RHdPSX-LnQ2g";
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key={key}";
        var json = "{\"contents\":[{\"parts\":[{\"text\":\"hi\"}]}]}";
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync(url, content);
        Console.WriteLine($"Model gemini-3-flash-preview: {(int)response.StatusCode}");
        if (!response.IsSuccessStatusCode) {
            var err = await response.Content.ReadAsStringAsync();
            Console.WriteLine(err);
        }
    }
}


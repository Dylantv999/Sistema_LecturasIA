
using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

class Program {
    static async Task Main() {
        var _httpClient = new HttpClient();
        var key = "AQ.Ab8RN6I9mF_nl1NiGJjl1Wlv9UraGnK6VcjvL14ReuURsJXS9g";
        var url = $"https://generativelanguage.googleapis.com/v1beta/models?key={key}";
        var response = await _httpClient.GetAsync(url);
        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        foreach (var model in doc.RootElement.GetProperty("models").EnumerateArray()) {
            var name = model.GetProperty("name").GetString();
            if (name.Contains("flash")) {
                Console.WriteLine(name);
            }
        }
    }
}


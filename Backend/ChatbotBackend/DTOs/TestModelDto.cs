namespace ChatbotBackend.DTOs
{
    public record TestModelInputDto(string Name, string Description);
    
    public record TestModelOutputDto(
        int Id, 
        string Name, 
        string Description, 
        DateTime CreatedAt);
}

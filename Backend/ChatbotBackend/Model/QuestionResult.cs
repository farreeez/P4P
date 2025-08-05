using System.ComponentModel.DataAnnotations;

public class QuestionResult
{
    [Key]
    public int Id { get; set; }
    public string Question { get; set; }
    public string UserAnswer { get; set; }
    public bool Correct { get; set; }
    public TimeSpan ResponseTime { get; set; }
}
using System.ComponentModel.DataAnnotations;

namespace Backend.Dtos
{
    public class TestModelInputDto
    {
        [Required]
        public string Name { get; set; }
    }
}

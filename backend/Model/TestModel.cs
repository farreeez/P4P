using System.ComponentModel.DataAnnotations;

namespace Backend.Model
{
    public class TestModel
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }
    }
}

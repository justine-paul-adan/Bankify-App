namespace WebAPI.DTOs
{
    public class ResponseDto<T>
    {
        public bool IsSuccess { get; set; }
        public T? Data { get; set; }
    }
}
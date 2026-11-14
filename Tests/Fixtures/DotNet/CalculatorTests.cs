using Xunit;

public class CalculatorTests
{
    [Fact]
    public void AddReturnsSum()
    {
        Assert.Equal(5, Add(2, 3));
    }

    private static int Add(int left, int right)
    {
        return left + right;
    }
}

package TestCase;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

import Base.DriverSetup;

public class Automation extends DriverSetup {
	public static String baseUrl = "https://www.printworksbd.com/";

	@Test

	public static void automat() throws InterruptedException {
		zbr.get(baseUrl);
//	zbr.manage().window().maximize(); 
		Thread.sleep(2000);

		zbr.findElement(By.xpath("//header/div[1]/div[1]/div[2]/ul[1]/li[5]/a[1]")).click();
		Thread.sleep(3000);

		zbr.findElement(By.cssSelector("a.btn-primary")).click();
		Thread.sleep(3000);
		zbr.findElement(By.id("reg_email")).sendKeys("zubaer.bcl@gmail.com");
		Thread.sleep(2000);
		zbr.findElement(By.name("password")).sendKeys("123654");
		Thread.sleep(2000);
		zbr.findElement(By.xpath("//input[@type='submit']")).click();
		Thread.sleep(5000);
		zbr.findElement(By.partialLinkText("Back")).click();
		Thread.sleep(2000);
		zbr.findElement(By.id("username")).sendKeys("zubaer.bcl@gmail.com");
		Thread.sleep(2000);
		zbr.findElement(By.name("password")).sendKeys("123654");
		Thread.sleep(2000);
		zbr.findElement(By.id("rememberme")).click();
		Thread.sleep(2000);
		zbr.findElement(By.name("login")).click();
		Thread.sleep(2000);

	}

}
